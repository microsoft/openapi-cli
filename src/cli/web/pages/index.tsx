// pages/index.tsx
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

interface Schema {
  [key: string]: any;
}

type Path = {
  [method: string]: {
    tags: string[];
    parameters: Parameter[];
    responses?: {
      [statusCode: string]: {
        content?: {
          [contentType: string]: {
            schema?: {
              items?: {
                $ref?: string;
              };
            };
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
  components: {
    schemas: {
      [key: string]: Schema;
    };
  };
};

type Props = {
  data: Data;
};

const CollapsibleSchema = ({ schema, name }: { schema: any, name: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div style={{ marginLeft: '20px' }}>
      <button
        onClick={toggleOpen}
        style={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
          marginRight: '5px',
          color: isOpen ? 'black' : 'gray',
        }}
      >
        ▶
      </button>
      <span>{name}</span>
      {isOpen && (
        <div>
          {Object.entries(schema).map(([key, value]) => (
            <div key={key}>
              {typeof value === 'object' && value !== null ? (
                <CollapsibleSchema schema={value} name={key} />
              ) : (
                <div style={{ marginLeft: '20px' }}>
                  <span>{key}: {JSON.stringify(value)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Home = ({ data, generatedObjects }:  { data: Data, generatedObjects: any }) => {
  const [openStates, setOpenStates] = useState<{ [key: string]: boolean }>({});

  const toggleOpen = (key: string) => {
    setOpenStates((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };
  const renderTextBoxes = (parameters: Parameter[]) => {
    return parameters.map((param) => (
      <div key={param.name}>
        <label>{param.name} ({param.schema.type}):</label>
        <input type="text" name={param.name} />
      </div>
    ));
  };

  const renderPaths = (paths: { [key: string]: Path }) => {
    
    return Object.keys(paths).map((pathKey) => {
      const ref = paths[pathKey]?.get?.responses?.['200']?.content?.['application/json']?.schema?.items?.$ref;
      const refName = ref ? ref.split('/').pop() : null;
      const object = refName ? generatedObjects[refName] : null;
      const isOpen = openStates[pathKey] || false;

      return (
      <div key={pathKey}>
        <h3>
          {pathKey}
          </h3>
        <div>
          {Object.keys(paths[pathKey]).map((methodKey) => (
            <div key={methodKey}>
              {renderTextBoxes(paths[pathKey][methodKey].parameters)}
              <button>Test</button>
              <div> Schema
                <button
              onClick={() => toggleOpen(pathKey)}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
                marginRight: '5px',
                color: isOpen ? 'black' : 'gray',
              }}
            >
              ▶ 
            </button>
              {isOpen && object && (
                    <CollapsibleSchema schema={object} name={refName || ''} />
                )}
            </div>
            </div>
          ))}
        </div>
      </div>
      );
  });
  };

  return (
    <div>
      <h1>{data.info.title}</h1>
      <p>{data.info.description}</p>
      <div>{renderPaths(data.paths)}</div>
    </div>
  );
};

const processProperties = (properties: any, schemas: any): any => {
  const object: { [key: string]: any } = {};

  for (const [propName, propDetails] of Object.entries(properties)) {
    const propDetailsAny: any = propDetails;
    if (propDetailsAny.type !== undefined) {
      object[propName] = propDetailsAny.type;
    } else if (propDetailsAny.$ref !== undefined) {
      const refName = propDetailsAny.$ref.split('/').pop();
      if (refName && schemas[refName]) {
        object[propName] = processProperties(schemas[refName].properties, schemas);
      } else {
        object[propName] = null;
      }
    } else {
      object[propName] = null;
    }
  }

  return object;
};

export const getServerSideProps: GetServerSideProps = async () => {
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(process.cwd(), 'data.json');
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  const data: Data = JSON.parse(jsonData);
//generating the schema objects
  const schemas = data.components.schemas;
  const generatedObjects: { [key: string]: any } = {};
  for (const [schemaName, schema] of Object.entries(schemas)) {
    generatedObjects[schemaName] = processProperties(schema.properties, schemas);
  }
  return {
    props: {
      data,
      generatedObjects,
    },
  };
};

export default Home;