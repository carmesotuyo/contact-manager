export interface BaseSearchCriteria {
  page?: number;
  limit?: number;
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IBaseRepository<T, C extends BaseSearchCriteria> {
  findAll(criteria: C): Promise<SearchResult<T>>;
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
  count(criteria: C): Promise<number>;
}
