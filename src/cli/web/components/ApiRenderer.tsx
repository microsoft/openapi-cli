// src/components/ApiRenderer.tsx

import { GetServerSideProps } from 'next';
import { useState } from 'react';

type Parameter = {
  name: string;
  in: string;
  required: boolean;
  schema: {
    type: string;
  };
};

type ResponseContentSchema = {
  type?: string;
  items?: {
    $ref?: string;
    type?: string;
    properties?: { [key: string]: ResponseContentSchema };
  };
  properties?: { [key: string]: ResponseContentSchema };
  $ref?: string;
};

type Path = {
  [method: string]: {
    tags: string[];
    parameters: Parameter[];
    responses: {
      [statusCode: string]: {
        description: string;
        content: {
          [contentType: string]: {
            schema: ResponseContentSchema;
          };
        };
      };
    };
  };
};

type Data = {
  info: {
    title: string;
    description: string;
  };
  paths: {
    [key: string]: Path;
  };
};

type Props = {
  data: Data;
};

const Home = ({ data }: Props) => {
  const [openPaths, setOpenPaths] = useState<{ [key: string]: boolean }>({});

  const togglePath = (path: string) => {
    setOpenPaths((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTextBoxes = (parameters: Parameter[]) => {
    return parameters.map((param) => (
      <div key={param.name}>
        <label>{param.name} ({param.schema.type}):</label>
        <input type="text" name={param.name} />
      </div>
    ));
  };

  const renderResponseTree = (schema: ResponseContentSchema, level = 0) => {
    if (schema.$ref) {
      return <li style={{ marginLeft: level * 20 }}>Reference: {schema.$ref}</li>;
    }

    if (schema.items) {
      if (schema.items.$ref) {
        return <li style={{ marginLeft: level * 20 }}>Items Reference: {schema.items.$ref}</li>;
      }
      return (
        <li style={{ marginLeft: level * 20 }}>
          Items:
          <ul>
            {renderResponseTree(schema.items, level + 1)}
          </ul>
        </li>
      );
    }

    if (schema.properties) {
      return (
        <ul style={{ marginLeft: level * 20 }}>
          {Object.entries(schema.properties).map(([key, value]) => (
            <li key={key}>
              {key}: {value.type}
              {value.properties && renderResponseTree(value, level + 1)}
            </li>
          ))}
        </ul>
      );
    }

    return null;
  };

  const renderPaths = (paths: { [key: string]: Path }) => {
    return Object.keys(paths).map((pathKey) => (
      <div key={pathKey}>
        <h3 onClick={() => togglePath(pathKey)}>{pathKey} {openPaths[pathKey] ? '-' : '+'}</h3>
        {openPaths[pathKey] && (
          <div>
            {Object.keys(paths[pathKey]).map((methodKey) => (
              <div key={methodKey}>
                {renderTextBoxes(paths[pathKey][methodKey].parameters)}
                <button>Test</button>
                <div>
                  <h4>Responses</h4>
                  <ul>
                    {Object.entries(paths[pathKey][methodKey].responses).map(([statusCode, response]) => (
                      <li key={statusCode}>
                        <span>{statusCode}: {response.description}</span>
                        {renderResponseTree(response.content["application/json"].schema)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div>
      <h1>{data.info.title}</h1>
      <p>{data.info.description}</p>
      <div>{renderPaths(data.paths)}</div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const fs = require('fs');
  const path = require('path');

  const filePath = path.join(process.cwd(), 'data.json');
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  const data: Data = JSON.parse(jsonData);

  return {
    props: {
      data,
    },
  };
};

export default Home;
