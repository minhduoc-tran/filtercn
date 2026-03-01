// ===== FIELD DEFINITION =====
export type FieldType = "text" | "number" | "select" | "multiselect" | "date" | "datetime" | "boolean" | "combobox";

export interface FilterFieldDefinition {
  /** Unique key, cũng là tên query param (e.g. "status", "category_id") */
  name: string;
  /** Label hiển thị trên UI */
  label: string;
  /** Loại input sẽ render */
  type: FieldType;
  /**
   * Danh sách operators được phép (nếu không truyền, lấy default)
   */
  operators?: OperatorType[];
  /**
   * Options tĩnh cho select/multiselect
   */
  options?: SelectOption[];
  /**
   * Hàm fetch options từ REST API (cho combobox/multiselect động)
   */
  fetchOptions?: (search: string) => Promise<SelectOption[]>;
}

// ===== OPERATORS =====
export type OperatorType =
  | "is" // =
  | "is_not" // !=
  | "contains" // *value*
  | "not_contains" // NOT *value*
  | "gt" // >
  | "gte" // >=
  | "lt" // <
  | "lte" // <=
  | "between" // range [from, to]
  | "in" // in list
  | "not_in" // not in list
  | "is_empty" // NULL/empty check
  | "is_not_empty";

// ===== SELECT OPTION =====
export interface SelectOption {
  label: string;
  value: string;
}

// ===== FILTER ROW (runtime state) =====
export interface FilterRow {
  id: string; // unique row id
  field: FilterFieldDefinition | null; // field đã chọn
  operator: OperatorType | null; // operator đã chọn
  value: FilterValue; // giá trị đã nhập
}

export type FilterValue =
  | string
  | string[]
  | number
  | [number, number] // range
  | [string, string] // date range
  | boolean
  | null;

// ===== FILTER GROUP (recursive tree node) =====
export interface FilterGroup {
  id: string;
  conjunction: "and" | "or";
  children: FilterNode[];
}

export type FilterNode = { type: "row"; row: FilterRow } | { type: "group"; group: FilterGroup };

// ===== FILTER STATE =====
export interface FilterState {
  root: FilterGroup;
}

// ===== REST QUERY OUTPUT =====
export type RestQueryParams = Record<string, string | string[]>;

// ===== FILTER CONFIG (truyền vào Provider) =====
export interface FilterConfig {
  /** Danh sách fields có thể filter */
  fields: FilterFieldDefinition[];
  /** Cho phép toggle AND/OR. Default: false */
  allowConjunctionToggle?: boolean;
  /** Cho phép tạo group lồng nhau. Default: false */
  allowGrouping?: boolean;
  /** Độ sâu tối đa cho group nesting. Default: 3 */
  maxGroupDepth?: number;
  /** Max filter rows. Default: 10 */
  maxRows?: number;
  /** Param style. Default: underscore */
  paramStyle?: "underscore" | "bracket" | "custom";
  /** Prefix appended to all query params. e.g "filter_" */
  paramPrefix?: string;
  /** Global search query param name. Default: q */
  searchParamName?: string;
  /** Custom builder */
  customParamBuilder?: (field: string, operator: OperatorType, value: FilterValue) => Record<string, string>;
  /** Locale */
  locale?: FilterLocale;
}

export interface FilterLocale {
  addFilter: string;
  addGroup: string;
  deleteGroup: string;
  reset: string;
  apply: string;
  placeholder: string;
  and: string;
  or: string;
  noFilters: string;
}
