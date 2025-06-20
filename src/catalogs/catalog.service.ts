import { CatalogRepository } from "./catalog.repository";
import { CatalogDto } from "./dtos/catalog.dto";

const catalogs = [
  {
    name: "Chapeus",
  },
  {
    name: "Oculos",
  },
];

export class CatalogService {
  private catalogRepository = new CatalogRepository();

  async createCatalog(dto: CatalogDto) {
    return this.catalogRepository.createCatelog(dto);
  }

  deleteCatalog(name: string) {
    const index = catalogs.findIndex(
      (catalog) => catalog.name.toLowerCase() === name.toLowerCase()
    );
    if (index === -1) {
      throw new Error(`Catalogo "${name}" não encontrado.`);
    }
    const deletedCatalog = catalogs.splice(index, 1);
    return deletedCatalog[0];
  }

  listCatalogs() {
    return this.catalogRepository.listAll();
  }
}
