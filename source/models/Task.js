import db from '../database/db.js';
import Workspace from './Workspace.js';

export default class Task {
    constructor(id = null, title = '', done = false, workspaceId = null, createdAt = null) {
        this.id = id;
        this.title = title;
        this.done = Boolean(done);
        this.workspaceId = workspaceId;
        this.createdAt = createdAt;
    }

    static create(title, workspaceId) {
        const stmt = db.prepare('INSERT INTO tasks (title, workspace_id) VALUES (?, ?)');
        const result = stmt.run(title, workspaceId);
        return new Task(result.lastInsertRowid, title, false, workspaceId, new Date().toISOString());
    }

    static findById(id) {
        const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
        const row = stmt.get(id);
        if (!row) return null;
        return new Task(row.id, row.title, row.done, row.workspace_id, row.created_at);
    }

    static findByWorkspaceId(workspaceId) {
        const stmt = db.prepare('SELECT * FROM tasks WHERE workspace_id = ? ORDER BY created_at DESC');
        const rows = stmt.all(workspaceId);
        return rows.map(row => new Task(row.id, row.title, row.done, row.workspace_id, row.created_at));
    }

    static findCompletedByWorkspaceId(workspaceId) {
        const stmt = db.prepare('SELECT * FROM tasks WHERE workspace_id = ? AND done = 1 ORDER BY created_at DESC');
        const rows = stmt.all(workspaceId);
        return rows.map(row => new Task(row.id, row.title, row.done, row.workspace_id, row.created_at));
    }

    static findPendingByWorkspaceId(workspaceId) {
        const stmt = db.prepare('SELECT * FROM tasks WHERE workspace_id = ? AND done = 0 ORDER BY created_at DESC');
        const rows = stmt.all(workspaceId);
        return rows.map(row => new Task(row.id, row.title, row.done, row.workspace_id, row.created_at));
    }

    static findAll() {
        const stmt = db.prepare('SELECT * FROM tasks ORDER BY created_at DESC');
        const rows = stmt.all();
        return rows.map(row => new Task(row.id, row.title, row.done, row.workspace_id, row.created_at));
    }

    updateTitle(title) {
        const stmt = db.prepare('UPDATE tasks SET title = ? WHERE id = ?');
        const result = stmt.run(title, this.id);
        if (result.changes > 0) {
            this.title = title;
            return true;
        }
        return false;
    }

    toggle() {
        const stmt = db.prepare('UPDATE tasks SET done = ? WHERE id = ?');
        const newDone = !this.done;
        const result = stmt.run(newDone ? 1 : 0, this.id);
        if (result.changes > 0) {
            this.done = newDone;
            return true;
        }
        return false;
    }

    markAsCompleted() {
        if (this.done) return true;
        const stmt = db.prepare('UPDATE tasks SET done = 1 WHERE id = ?');
        const result = stmt.run(this.id);
        if (result.changes > 0) {
            this.done = true;
            return true;
        }
        return false;
    }

    markAsPending() {
        if (!this.done) return true;
        const stmt = db.prepare('UPDATE tasks SET done = 0 WHERE id = ?');
        const result = stmt.run(this.id);
        if (result.changes > 0) {
            this.done = false;
            return true;
        }
        return false;
    }

    delete() {
        const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
        const result = stmt.run(this.id);
        return result.changes > 0;
    }

    getWorkspace() {
        return Workspace.findById(this.workspaceId);
    }

    toObject() {
        return {
            id: this.id,
            title: this.title,
            done: this.done,
            workspaceId: this.workspaceId,
            createdAt: this.createdAt
        };
    }

    getStatus() {
        return this.done ? '✓ Completed' : '○ Pending';
    }
} 