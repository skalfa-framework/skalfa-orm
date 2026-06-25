<p align="center">
  <img src="https://skalfa.sejedigital.com/images/logo-skalfa.png" alt="Skalfa Logo" width="300" />
</p>

# @skalfa/skalfa-orm

> Knex-based relational database ORM, model mapper, and schema migration extension for PostgreSQL in Skalfa.

---

## About this Package

This package is part of the **Skalfa Framework**, a premium development ecosystem designed to build high-performance, modular web applications and APIs.

### Usage Scope & Standalone Status
> 💡 **Standalone Capability:** This package is **fully standalone**! You can install and use it in **any external Node.js, Bun, or TypeScript project**, completely independent of the Skalfa ecosystem.

---

## Documentation

See the usage documentation at [Documentation](https://skalfa.sejedigital.com).

---

## Installation

You can install this package using your preferred package manager:

```bash
# Using npm
npm install @skalfa/skalfa-orm

# Using bun
bun add @skalfa/skalfa-orm
```

---

## Database Migrations & Seeding CLI Guide

This Knex-based ORM provides a set of CLI commands in the host project to manage relational PostgreSQL schemas:

### 🗄️ Migration Management
* **`bun skalfa db:migrate:make <name>`**: Generates a new Knex SQL migration file in your database migrations directory.
* **`bun skalfa db:migrate:latest`**: Applies all pending migrations to the target PostgreSQL database.
* **`bun skalfa db:migrate:rollback`**: Rolls back the last applied migration batch.

### 🌾 Seeding Management
* **`bun skalfa db:seed:make <name>`**: Generates a new Knex SQL database seed file.
* **`bun skalfa db:seed:run`**: Executes all seed files to populate the database with initial/mock data.

---

## Pre-installed Dependencies

The following key dependencies are packaged and managed within this project:

| Dependency | Scope | Version |
| :--- | :--- | :--- |
| `knex` | runtime | `^3.1.0` |
| `pg` | runtime | `^8.16.3` |
| `elysia` | runtime | `^1.2.0` |
| `@types/node` | development | `^26.0.0` |
| `typescript` | development | `^6.0.3` |

---

## License

This package is licensed under the **MIT License**. For full license text, see the [LICENSE](LICENSE) file.
