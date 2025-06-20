import { db } from "../db/orm";
import { catalog } from "../db/schema/catalog.schema";
import { NotFoundException } from "../exceptions/base.exceptions";
import { CatalogDto } from "./dtos/catalog.dto";

export class CatalogRepository {
  async createCatelog(cteateCatalogDto: CatalogDto) {
    const catalogExists = await this.findByName(cteateCatalogDto.name);

    if (catalogExists) {
      throw new NotFoundException(
        `Catalogo "${cteateCatalogDto.name}" já existe.`
      );
    }

    const [data] = await db
      .insert(catalog)
      .values({
        name: cteateCatalogDto.name,
      })
      .returning({
        name: catalog.name,
        id: catalog.id,
      });

    return data;
  }

  listAll() {
    return db.query.catalog.findMany({
      orderBy: (catalog, { asc }) => asc(catalog.id),
    });
  }

  async findByName(name: string) {
    const data = await db.query.catalog.findFirst({
      where: (users, { eq }) => eq(users.name, name),
    });

    return data;
  }
}
