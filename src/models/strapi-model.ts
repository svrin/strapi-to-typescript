export type StrapiType = 'string' | 'number' | 'boolean' | 'text' | 'date' | 'email' | 'component' | 'enumeration' | 'dynamiczone' | 'relation' | 'media';

export interface IStrapiModelAttribute {
  unique?: boolean;
  required?: boolean;
  type?: StrapiType;
  columnType?: StrapiType;
  default?: string | number | boolean;
  dominant?: boolean;
  collection?: string;
  model?: string;
  via?: string;
  plugin?: string;
  enum?: string[];
  component?: string;
  components?: string[];
  repeatable?: boolean;
  multiple?: boolean;
  min?: number;
  max?: number;
  relation?: 'manyToOne' | 'oneToOne' | 'oneToMany' | 'morphToMany'
  target?: string;
}

export interface IStrapiModel {
  /** Not from Strapi, but is the filename on disk */
  _filename: string;
  _isComponent?: boolean;

  connection: string;
  collectionName: string;
  info: {
    name: string;
    description: string;
    icon?: string;
  };
  options?: {
    timestamps: boolean;
  };
  attributes: { [attr: string]: IStrapiModelAttribute };
}
