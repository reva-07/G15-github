import { supabase, isConfigured } from "./supabase.js";
import { getItem, setItem } from "../utils/Storage.js";

const STORAGE_KEY_DOCS = "gdocs_documents";
const STORAGE_KEY_USERS = "gdocs_users";
const STORAGE_KEY_AUTH = "gdocs_auth_session";
const STORAGE_KEY_SHARES = "gdocs_shares";
const STORAGE_KEY_VERSIONS = "gdocs_versions";

// ==============================================================================
// LOCAL REST-LIKE DATABASE ENGINE
// Stores documents, users, collaborator shares, and revision snapshots in localStorage.
// Ensures backward compatibility with legacy "documents" and "authUser" keys.
// ==============================================================================

function generateDeterministicUserId(email) {
  const normalized = (email || "").trim().toLowerCase();
  if (!normalized || normalized === "demo@gdocs.lite") {
    return "u_demo_1";
  }
  let hash = 0x811c9dc5;
  for (let i = 0; i < normalized.length; i++) {
    hash ^= normalized.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  const cleanPrefix = normalized.split("@")[0].replace(/[^a-z0-9]/gi, "").slice(0, 10);
  return `u_${cleanPrefix || "user"}_${hash.toString(36)}`;
}

const SAMPLE_SHARED_DOC_ID = "doc-sample-shared-1";
const SAMPLE_COLLAB_OWNER_ID = "u_collab_eval";

const SAMPLE_SHARED_DOC = {
  id: SAMPLE_SHARED_DOC_ID,
  owner_id: SAMPLE_COLLAB_OWNER_ID,
  title: "Team Project Guidelines (Shared with You)",
  content:
    "<h1>Team Collaboration & Guidelines</h1><p>Welcome to Google Docs Lite! This document was shared with your demo account (<code>demo@gdocs.lite</code>) by your team coordinator.</p><h2>Project Scope</h2><ul><li>Review syllabus alignment for FEE-II evaluation.</li><li>Verify collaborator permissions and shared view filters.</li><li>Ensure live document updates persist cleanly.</li></ul><p>Feel free to open and review this document to test shared access!</p>",
  is_starred: false,
  is_trashed: false,
  created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  updated_at: new Date(Date.now() - 3600000 * 6).toISOString(),
};

const SAMPLE_SHARE_RECORD = {
  id: "sh_sample_demo_1",
  document_id: SAMPLE_SHARED_DOC_ID,
  shared_with_email: "demo@gdocs.lite",
  role: "editor",
  created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
};

function getLocalUsers() {
  const users = getItem(STORAGE_KEY_USERS, null);
  if (!users || !Array.isArray(users) || users.length === 0) {
    const initialUsers = [
      {
        id: "u_demo_1",
        email: "demo@gdocs.lite",
        password: "password123",
        name: "Bhumi (Demo)",
      },
      {
        id: "u_collab_eval",
        email: "evaluator@college.edu",
        password: "password123",
        name: "Team Coordinator (Faculty)",
      },
    ];
    setItem(STORAGE_KEY_USERS, initialUsers);
    return initialUsers;
  }
  return users;
}

function getLocalDocs() {
  // Check new key first, then fall back to legacy "documents" key
  let existing = getItem(STORAGE_KEY_DOCS, null);
  if (!existing || !Array.isArray(existing) || existing.length === 0) {
    const legacy = getItem("documents", null);
    if (legacy && Array.isArray(legacy) && legacy.length > 0) {
      existing = legacy;
      saveLocalDocs(existing);
    }
  }

  if (existing && Array.isArray(existing) && existing.length > 0) {
    // Safely ensure sample shared document is present without overwriting existing documents
    if (!existing.some((d) => String(d.id) === SAMPLE_SHARED_DOC_ID)) {
      existing.push(SAMPLE_SHARED_DOC);
      saveLocalDocs(existing);
    }
    return existing;
  }

  // Initial seed documents
  const initial = [
    {
      id: "doc-sample-1",
      owner_id: "u_demo_1",
      title: "DBMS Lecture Notes: Relational Model & SQL",
      content:
        "<h1>DBMS Lecture Notes</h1><p>A relational database organizes data into one or more tables (or 'relations') of columns and rows. Each row is known as a tuple.</p><h2>Key Concepts</h2><ul><li><strong>Primary Key:</strong> Uniquely identifies each record.</li><li><strong>Foreign Key:</strong> References a primary key in another table.</li><li><strong>ACID Properties:</strong> Atomicity, Consistency, Isolation, Durability.</li></ul>",
      is_starred: true,
      is_trashed: false,
      created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: "doc-sample-2",
      owner_id: "u_demo_1",
      title: "Front End Engineering-II Project Plan",
      content:
        "<h1>Front End Engineering-II Evaluation</h1><p>Architecture breakdown of Google Docs Lite application.</p><h2>Topics Implemented</h2><ul><li>React Router v7 with protected navigation</li><li>Context API for Authentication and Theme</li><li>Zustand for Active Document Editor state</li><li>Supabase PostgreSQL API + Row-Level Security</li><li>Debounced search, filtering, and pagination</li></ul>",
      is_starred: true,
      is_trashed: false,
      created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
    {
      id: "doc-sample-3",
      owner_id: "u_demo_1",
      title: "Weekly Sprint Meeting Agenda",
      content:
        "<h2>Sprint Planning & Retro</h2><p>Date: October 2026</p><p>Objectives:</p><ol><li>Review outstanding PRs</li><li>Ship light/dark theme switch</li><li>Add safe auto-save retry queue</li></ol>",
      is_starred: false,
      is_trashed: false,
      created_at: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
    {
      id: "doc-sample-4",
      owner_id: "u_demo_1",
      title: "Old Draft (Moved to Trash)",
      content: "<p>This is a deprecated draft stored in the trash.</p>",
      is_starred: false,
      is_trashed: true,
      created_at: new Date(Date.now() - 3600000 * 24 * 14).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    },
    SAMPLE_SHARED_DOC,
  ];

  saveLocalDocs(initial);
  return initial;
}

function saveLocalDocs(docs) {
  setItem(STORAGE_KEY_DOCS, docs);
  setItem("documents", docs); // Backward compatibility with legacy code
}

function getLocalShares() {
  const existing = getItem(STORAGE_KEY_SHARES, null);
  if (!existing || !Array.isArray(existing) || existing.length === 0) {
    const initialShares = [SAMPLE_SHARE_RECORD];
    setItem(STORAGE_KEY_SHARES, initialShares);
    return initialShares;
  }

  // Safely ensure sample share record is present without overwriting existing shares
  if (
    !existing.some(
      (s) =>
        String(s.document_id) === SAMPLE_SHARED_DOC_ID &&
        s.shared_with_email.toLowerCase() === "demo@gdocs.lite"
    )
  ) {
    const updated = [...existing, SAMPLE_SHARE_RECORD];
    setItem(STORAGE_KEY_SHARES, updated);
    return updated;
  }

  return existing;
}

function getLocalVersions() {
  return getItem(STORAGE_KEY_VERSIONS, []);
}

// Small delay simulation
const delay = (ms = 50) => new Promise((resolve) => setTimeout(resolve, ms));

// ==============================================================================
// PUBLIC API MODULE
// ==============================================================================

export const api = {
  getMode() {
    return {
      isCloud: isConfigured,
      mode: isConfigured ? "supabase" : "local_database",
      status: isConfigured
        ? "Connected to Supabase PostgreSQL Cloud"
        : "",
    };
  },

  // ----------------------------------------------------------------------------
  // AUTHENTICATION APIs
  // ----------------------------------------------------------------------------
  auth: {
    async getSession() {
      if (isConfigured) {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!data?.session?.user) return { user: null };
        const user = data.session.user;
        return {
          user: {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email.split("@")[0],
          },
        };
      }

      await delay(20);
      let session = getItem(STORAGE_KEY_AUTH, null);
      if (!session) {
        // Fallback to legacy authUser from original app
        const legacyAuth = getItem("authUser", null);
        if (legacyAuth) {
          const authEmail = legacyAuth.email || "demo@gdocs.lite";
          const existingUser = getLocalUsers().find(
            (u) => u.email.toLowerCase() === authEmail.toLowerCase()
          );
          session = {
            id: legacyAuth.id || existingUser?.id || generateDeterministicUserId(authEmail),
            email: authEmail,
            name: legacyAuth.name || authEmail.split("@")[0],
          };
          setItem(STORAGE_KEY_AUTH, session);
        }
      }

      if (session && !session.id) {
        const existingUser = getLocalUsers().find(
          (u) => u.email.toLowerCase() === (session.email || "").toLowerCase()
        );
        session.id = existingUser?.id || generateDeterministicUserId(session.email);
        setItem(STORAGE_KEY_AUTH, session);
      }

      return { user: session };
    },

    async register({ email, password, name }) {
      if (isConfigured) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });
        if (error) throw error;
        const user = data?.user;
        return {
          user: user
            ? {
                id: user.id,
                email: user.email,
                name: user.user_metadata?.name || name,
              }
            : null,
          requiresEmailConfirmation: !data?.session,
        };
      }

      await delay(100);
      const users = getLocalUsers();
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("An account with this email already exists.");
      }

      const newUser = {
        id: "u_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        email,
        password,
        name: name || email.split("@")[0],
      };

      users.push(newUser);
      setItem(STORAGE_KEY_USERS, users);

      const sessionUser = { id: newUser.id, email: newUser.email, name: newUser.name };
      setItem(STORAGE_KEY_AUTH, sessionUser);
      setItem("authUser", sessionUser);
      return { user: sessionUser };
    },

    async login({ email, password }) {
      if (isConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        const user = data?.user;
        return {
          user: {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || user.email.split("@")[0],
          },
        };
      }

      await delay(100);
      const users = getLocalUsers();
      const match = users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!match) {
        // Fallback for prototype friendliness if any credentials were typed
        const existingUser = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        const resolvedId = existingUser?.id || generateDeterministicUserId(email);

        const fallbackUser = {
          id: resolvedId,
          email,
          name: existingUser?.name || email.split("@")[0],
        };
        setItem(STORAGE_KEY_AUTH, fallbackUser);
        setItem("authUser", fallbackUser);
        return { user: fallbackUser };
      }

      const sessionUser = { id: match.id, email: match.email, name: match.name };
      setItem(STORAGE_KEY_AUTH, sessionUser);
      setItem("authUser", sessionUser);
      return { user: sessionUser };
    },

    async logout() {
      if (isConfigured) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return true;
      }

      await delay(20);
      localStorage.removeItem(STORAGE_KEY_AUTH);
      localStorage.removeItem("authUser");
      return true;
    },
  },

  // ----------------------------------------------------------------------------
  // DOCUMENTS CRUD APIs
  // ----------------------------------------------------------------------------
  documents: {
    async list({ currentUser, view = "all", search = "", sortBy = "updated_at", sortOrder = "desc" }) {
      if (isConfigured) {
        if (!currentUser?.id) throw new Error("Unauthorized: You must be logged in.");
        let query = supabase
          .from("documents")
          .select("id, owner_id, title, content, is_starred, is_trashed, created_at, updated_at");

        if (view === "trash") {
          query = query.eq("is_trashed", true);
        } else {
          query = query.eq("is_trashed", false);
          if (view === "starred") {
            query = query.eq("is_starred", true);
          } else if (view === "owned") {
            query = query.eq("owner_id", currentUser.id);
          }
        }

        if (search.trim()) {
          query = query.ilike("title", `%${search.trim()}%`);
        }

        query = query.order(sortBy, { ascending: sortOrder === "asc" });

        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }

      await delay(30);
      const docs = getLocalDocs();
      const shares = getLocalShares();

      // In local mode, accessible if no owner_id, or owner matches, or shared with user
      const userAccessible = docs.filter((doc) => {
        if (!doc.owner_id) return true;
        if (!currentUser?.id) return true;
        const isOwner = String(doc.owner_id) === String(currentUser.id);
        const isShared = currentUser?.email && shares.some(
          (s) =>
            String(s.document_id) === String(doc.id) &&
            s.shared_with_email.toLowerCase() === currentUser.email.toLowerCase()
        );
        return isOwner || isShared;
      });

      // Filter by view
      let filtered = userAccessible.filter((doc) => {
        if (view === "trash") return Boolean(doc.is_trashed);
        if (doc.is_trashed) return false;
        if (view === "starred") return Boolean(doc.is_starred);
        if (view === "owned") return !doc.owner_id || String(doc.owner_id) === String(currentUser?.id);
        if (view === "shared") {
          return (
            doc.owner_id &&
            String(doc.owner_id) !== String(currentUser?.id) &&
            shares.some(
              (s) =>
                String(s.document_id) === String(doc.id) &&
                s.shared_with_email.toLowerCase() === currentUser?.email?.toLowerCase()
            )
          );
        }
        return true;
      });

      // Search filter
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        filtered = filtered.filter(
          (d) =>
            (d.title && d.title.toLowerCase().includes(query)) ||
            (d.content && d.content.toLowerCase().includes(query))
        );
      }

      // Sort
      filtered.sort((a, b) => {
        let valA = a[sortBy] || a.updatedAt || "";
        let valB = b[sortBy] || b.updatedAt || "";
        if (sortBy === "title") {
          return sortOrder === "asc"
            ? String(valA).localeCompare(String(valB))
            : String(valB).localeCompare(String(valA));
        }
        return sortOrder === "asc"
          ? new Date(valA) - new Date(valB)
          : new Date(valB) - new Date(valA);
      });

      return filtered;
    },

    async getById(id, currentUser) {
      if (isConfigured) {
        if (!currentUser?.id) throw new Error("Unauthorized");
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .eq("id", id)
          .single();
        if (error) throw error;
        return data;
      }

      await delay(20);
      const docs = getLocalDocs();
      const doc = docs.find((d) => String(d.id) === String(id));
      if (!doc) throw new Error("Document not found");

      return doc;
    },

    async create({ currentUser, title = "Untitled document", content = "<p>Start writing...</p>" }) {
      const ownerId = currentUser?.id || "u_demo_1";
      const newDoc = {
        title,
        content,
        owner_id: ownerId,
        is_starred: false,
        is_trashed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isConfigured) {
        if (!currentUser?.id) throw new Error("Unauthorized");
        const { data, error } = await supabase
          .from("documents")
          .insert([newDoc])
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      await delay(30);
      const docs = getLocalDocs();
      const created = {
        ...newDoc,
        id: "doc_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      };
      docs.unshift(created);
      saveLocalDocs(docs);
      return created;
    },

    async update(id, updates, currentUser) {
      const updatePayload = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      if (isConfigured) {
        if (!currentUser?.id) throw new Error("Unauthorized");
        const { data, error } = await supabase
          .from("documents")
          .update(updatePayload)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      await delay(30);
      const docs = getLocalDocs();
      const index = docs.findIndex((d) => String(d.id) === String(id));
      if (index === -1) throw new Error("Document not found");

      docs[index] = { ...docs[index], ...updatePayload };
      saveLocalDocs(docs);
      return docs[index];
    },

    async duplicate(id, currentUser) {
      const original = await this.getById(id, currentUser);
      return this.create({
        currentUser,
        title: `Copy of ${original.title}`,
        content: original.content,
      });
    },

    async toggleTrash(id, is_trashed, currentUser) {
      return this.update(id, { is_trashed }, currentUser);
    },

    async toggleStar(id, is_starred, currentUser) {
      return this.update(id, { is_starred }, currentUser);
    },

    async deletePermanently(id, currentUser) {
      if (isConfigured) {
        if (!currentUser?.id) throw new Error("Unauthorized");
        const { error } = await supabase
          .from("documents")
          .delete()
          .eq("id", id)
          .eq("owner_id", currentUser.id);
        if (error) throw error;
        return true;
      }

      await delay(30);
      const docs = getLocalDocs();
      const filtered = docs.filter((d) => String(d.id) !== String(id));
      saveLocalDocs(filtered);
      return true;
    },
  },

  // ----------------------------------------------------------------------------
  // SHARING & COLLABORATION PERMISSIONS
  // ----------------------------------------------------------------------------
  shares: {
    async list(documentId) {
      if (isConfigured) {
        const { data, error } = await supabase
          .from("document_shares")
          .select("*")
          .eq("document_id", documentId);
        if (error) throw error;
        return data || [];
      }

      await delay(20);
      const shares = getLocalShares();
      return shares.filter((s) => String(s.document_id) === String(documentId));
    },

    async add(documentId, email, role = "viewer") {
      if (isConfigured) {
        const { data, error } = await supabase
          .from("document_shares")
          .insert([{ document_id: documentId, shared_with_email: email, role }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      await delay(30);
      const shares = getLocalShares();
      const existing = shares.find(
        (s) =>
          String(s.document_id) === String(documentId) &&
          s.shared_with_email.toLowerCase() === email.toLowerCase()
      );
      if (existing) {
        existing.role = role;
      } else {
        shares.push({
          id: "sh_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          document_id: documentId,
          shared_with_email: email.toLowerCase(),
          role,
          created_at: new Date().toISOString(),
        });
      }
      setItem(STORAGE_KEY_SHARES, shares);
      return true;
    },

    async remove(documentId, email) {
      if (isConfigured) {
        const { error } = await supabase
          .from("document_shares")
          .delete()
          .eq("document_id", documentId)
          .eq("shared_with_email", email);
        if (error) throw error;
        return true;
      }

      await delay(20);
      const shares = getLocalShares();
      const updated = shares.filter(
        (s) =>
          !(
            String(s.document_id) === String(documentId) &&
            s.shared_with_email.toLowerCase() === email.toLowerCase()
          )
      );
      setItem(STORAGE_KEY_SHARES, updated);
      return true;
    },
  },

  // ----------------------------------------------------------------------------
  // VERSION HISTORY & SNAPSHOT RESTORE
  // ----------------------------------------------------------------------------
  versions: {
    async list(documentId) {
      if (isConfigured) {
        const { data, error } = await supabase
          .from("document_versions")
          .select("*")
          .eq("document_id", documentId)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      }

      await delay(20);
      const versions = getLocalVersions();
      return versions
        .filter((v) => String(v.document_id) === String(documentId))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },

    async createSnapshot(documentId, title, content, currentUser) {
      const version = {
        document_id: documentId,
        title,
        content,
        created_by: currentUser?.id || "u_demo_1",
        created_at: new Date().toISOString(),
      };

      if (isConfigured) {
        const { data, error } = await supabase
          .from("document_versions")
          .insert([version])
          .select()
          .single();
        if (error) throw error;
        return data;
      }

      await delay(20);
      const versions = getLocalVersions();
      const newVersion = {
        ...version,
        id: "ver_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      };
      versions.unshift(newVersion);
      setItem(STORAGE_KEY_VERSIONS, versions.slice(0, 50));
      return newVersion;
    },
  },
};
