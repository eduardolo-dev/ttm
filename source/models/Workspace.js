import db from '../database/db.js';
import Task from './Task.js';

export default class Workspace {
    constructor(id = null, name = '', createdAt = null) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
    }

    static create(name) {
        const stmt = db.prepare('INSERT INTO workspaces (name) VALUES (?)');
        const result = stmt.run(name);
        return new Workspace(result.lastInsertRowid, name, new Date().toISOString());
    }

    static findById(id) {
        const stmt = db.prepare('SELECT * FROM workspaces WHERE id = ?');
        const row = stmt.get(id);
        if (!row) return null;
        return new Workspace(row.id, row.name, row.created_at);
    }

    static findByName(name) {
        const stmt = db.prepare('SELECT * FROM workspaces WHERE name = ?');
        const row = stmt.get(name);
        if (!row) return null;
        return new Workspace(row.id, row.name, row.created_at);
    }

    static findAll() {
        const stmt = db.prepare('SELECT * FROM workspaces ORDER BY created_at DESC');
        const rows = stmt.all();
        return rows.map(row => new Workspace(row.id, row.name, row.created_at));
    }

    update(name) {
        const stmt = db.prepare('UPDATE workspaces SET name = ? WHERE id = ?');
        const result = stmt.run(name, this.id);
        if (result.changes > 0) {
            this.name = name;
            return true;
        }
        return false;
    }

    delete() {
        const stmt = db.prepare('DELETE FROM workspaces WHERE id = ?');
        const result = stmt.run(this.id);
        return result.changes > 0;
    }

    getTasks() {
        const stmt = db.prepare('SELECT * FROM tasks WHERE workspace_id = ? ORDER BY created_at DESC');
        const rows = stmt.all(this.id);
        return rows.map(row => new Task(row.id, row.title, row.done, row.workspace_id, row.created_at));
    }

    getTaskCount() {
        const stmt = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE workspace_id = ?');
        const result = stmt.get(this.id);
        return result.count;
    }

    getCompletedTaskCount() {
        const stmt = db.prepare('SELECT COUNT(*) as count FROM tasks WHERE workspace_id = ? AND done = 1');
        const result = stmt.get(this.id);
        return result.count;
    }

    toObject() {
        return {
            id: this.id,
            name: this.name,
            createdAt: this.createdAt,
            taskCount: this.getTaskCount(),
            completedTaskCount: this.getCompletedTaskCount()
        };
    }
} 