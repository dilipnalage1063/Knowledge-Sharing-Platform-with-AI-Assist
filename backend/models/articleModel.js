const db = require('../config/db');

const Article = {
    /**
     * Create a new article with tags
     */
    create: async (articleData, tagNames = []) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { title, content, summary, category, author_id } = articleData;

            // 1. Insert Article
            const [artResult] = await connection.execute(
                'INSERT INTO articles (title, content, summary, category, author_id) VALUES (?, ?, ?, ?, ?)',
                [title, content, summary, category, author_id]
            );
            const articleId = artResult.insertId;

            // 2. Handle Tags
            if (tagNames.length > 0) {
                for (const tagName of tagNames) {
                    // Find or create tag
                    await connection.execute(
                        'INSERT IGNORE INTO tags (name) VALUES (?)',
                        [tagName]
                    );
                    const [tagRows] = await connection.execute(
                        'SELECT id FROM tags WHERE name = ?',
                        [tagName]
                    );
                    const tagId = tagRows[0].id;

                    // Link tag to article
                    await connection.execute(
                        'INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)',
                        [articleId, tagId]
                    );
                }
            }

            await connection.commit();
            return articleId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    /**
     * Get all articles with author, tags, filtering, and pagination
     */
    findAll: async (filters = {}) => {
        let { category, search, tag, page = 1, limit = 10 } = filters;

        // Ensure numbers are valid
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;

        let query = `
            SELECT a.*, u.username as author_name, 
            GROUP_CONCAT(t.name) as tags
            FROM articles a
            JOIN users u ON a.author_id = u.id
            LEFT JOIN article_tags at ON a.id = at.article_id
            LEFT JOIN tags t ON at.tag_id = t.id
        `;

        const queryParams = [];
        const whereClauses = [];

        // 1. Filter by Category
        if (category) {
            whereClauses.push('a.category = ?');
            queryParams.push(category);
        }

        // 2. Search by Title or Content
        if (search) {
            whereClauses.push('(a.title LIKE ? OR a.content LIKE ?)');
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        // 3. Filter by Tag
        if (tag) {
            whereClauses.push('a.id IN (SELECT article_id FROM article_tags at2 JOIN tags t2 ON at2.tag_id = t2.id WHERE t2.name = ?)');
            queryParams.push(tag);
        }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        query += ' GROUP BY a.id ORDER BY a.created_at DESC';

        // Prepare Count Query
        let countQuery = 'SELECT COUNT(DISTINCT a.id) as total FROM articles a LEFT JOIN article_tags at ON a.id = at.article_id LEFT JOIN tags t ON at.tag_id = t.id';
        const countParams = [...queryParams];
        if (whereClauses.length > 0) {
            countQuery += ' WHERE ' + whereClauses.join(' AND ');
        }

        // Add Pagination to main query
        query += ' LIMIT ? OFFSET ?';
        queryParams.push(limit, offset);

        const [rows] = await db.query(query, queryParams);
        const [countResult] = await db.query(countQuery, countParams);

        return {
            articles: rows,
            total: countResult[0].total,
            page,
            limit
        };
    },

    /**
     * Get single article by ID
     */
    findById: async (id) => {
        const query = `
            SELECT a.*, u.username as author_name,
            GROUP_CONCAT(t.name) as tags
            FROM articles a
            JOIN users u ON a.author_id = u.id
            LEFT JOIN article_tags at ON a.id = at.article_id
            LEFT JOIN tags t ON at.tag_id = t.id
            WHERE a.id = ?
            GROUP BY a.id
        `;
        const [rows] = await db.execute(query, [id]);
        return rows[0];
    },

    /**
     * Update an article
     */
    update: async (id, articleData, tagNames = []) => {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { title, content, summary, category } = articleData;

            // 1. Update Article Fields
            await connection.execute(
                'UPDATE articles SET title = ?, content = ?, summary = ?, category = ? WHERE id = ?',
                [title, content, summary, category, id]
            );

            // 2. Refresh Tags
            if (tagNames !== undefined) {
                // Delete existing links
                await connection.execute('DELETE FROM article_tags WHERE article_id = ?', [id]);

                // Add new ones
                for (const tagName of tagNames) {
                    await connection.execute('INSERT IGNORE INTO tags (name) VALUES (?)', [tagName]);
                    const [tagRows] = await connection.execute('SELECT id FROM tags WHERE name = ?', [tagName]);
                    const tagId = tagRows[0].id;
                    await connection.execute('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)', [id, tagId]);
                }
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    /**
     * Delete an article
     */
    delete: async (id) => {
        const [result] = await db.execute('DELETE FROM articles WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },

    /**
     * Get articles by author ID (Internal Dashboard)
     */
    findByAuthor: async (authorId) => {
        const query = `
            SELECT a.*, u.username as author_name,
            GROUP_CONCAT(t.name) as tags
            FROM articles a
            JOIN users u ON a.author_id = u.id
            LEFT JOIN article_tags at ON a.id = at.article_id
            LEFT JOIN tags t ON at.tag_id = t.id
            WHERE a.author_id = ?
            GROUP BY a.id
            ORDER BY a.created_at DESC
        `;
        const [rows] = await db.execute(query, [authorId]);
        return rows;
    }
};

module.exports = Article;
