// src/types.ts
export interface Parameter {
  name: string;
  in: string;
  required: boolean;
  schema: {
    type: string;
  };
}

export interface ResponseContentSchema {
  type?: string;
  properties?: {
    [key: string]: ResponseContentSchema;
  };
  items?: ResponseContentSchema | { $ref: string };
  $ref?: string;
}

export interface ResponseContent {
  schema: ResponseContentSchema;
}

export interface Response {
  description: string;
  content: {
    [key: string]: ResponseContent;
  };
}

export interface PathDetails {
  get: {
    tags: string[];
    parameters: Parameter[];
    responses: {
      [statusCode: string]: Response;
    };
  };
}

export interface ApiData {
  info: {
    title: string;
    description: string;
  };
  paths: {
    [path: string]: PathDetails;
  };
}
