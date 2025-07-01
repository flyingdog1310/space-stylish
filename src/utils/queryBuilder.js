class QueryBuilder {
    constructor() {
        this.sql = '';
        this.params = [];
        this.conditions = [];
        this.orderBy = [];
        this.limit = null;
        this.offset = null;
    }

    select(fields, table) {
        this.sql = `SELECT ${fields} FROM ${table}`;
        return this;
    }

    where(field, operator, value) {
        if (value !== undefined && value !== null) {
            this.conditions.push(`${field} ${operator} ?`);
            this.params.push(value);
        }
        return this;
    }

    whereIn(field, values) {
        if (Array.isArray(values) && values.length > 0) {
            const placeholders = values.map(() => '?').join(',');
            this.conditions.push(`${field} IN (${placeholders})`);
            this.params.push(...values);
        }
        return this;
    }

    orderBy(field, direction = 'ASC') {
        this.orderBy.push(`${field} ${direction.toUpperCase()}`);
        return this;
    }

    limit(count) {
        this.limit = count;
        return this;
    }

    offset(start) {
        this.offset = start;
        return this;
    }

    build() {
        let finalSql = this.sql;

        // 添加 WHERE 條件
        if (this.conditions.length > 0) {
            finalSql += ` WHERE ${this.conditions.join(' AND ')}`;
        }

        // 添加 ORDER BY
        if (this.orderBy.length > 0) {
            finalSql += ` ORDER BY ${this.orderBy.join(', ')}`;
        }

        // 添加 LIMIT 和 OFFSET
        if (this.limit !== null) {
            if (this.offset !== null) {
                finalSql += ` LIMIT ${this.offset}, ${this.limit}`;
            } else {
                finalSql += ` LIMIT ${this.limit}`;
            }
        }

        return {
            sql: finalSql,
            params: this.params
        };
    }

    // 靜態方法用於快速構建查詢
    static createSelect(table, fields = '*') {
        return new QueryBuilder().select(fields, table);
    }

    static createCount(table) {
        return new QueryBuilder().select('COUNT(*) as total', table);
    }
}

export default QueryBuilder;
