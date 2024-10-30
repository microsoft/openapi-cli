// pages/index.tsx
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import styles from './styles.module.css';


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


const CollapsibleSchema = ({ schema, name }: { schema: any, name: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className={styles.collapsibleSchema}>
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
                (value as any).type === 'array' ? (
                  <CollapsibleSchema schema={(value as any).items} name={`${key} (array)`} />
                ) : (
                <CollapsibleSchema schema={value} name={key} />
              )
              ):(
                <div className={styles.schemaItem}>
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
      const methods = Object.keys(paths[pathKey]);
      let ref = null;

    // Iterate over methods to find the $ref
    for (const method of methods) {
      const schema = paths[pathKey][method]?.responses?.['200']?.content?.['application/json']?.schema;
      ref = schema?.items?.$ref || schema?.$ref;
      if (ref) break; // Stop if $ref is found
    }
      
      const refName = ref ? ref.split('/').pop() : null;
      const object = refName ? generatedObjects[refName] : null;
      const isOpen = openStates[pathKey] || false;
      
      return (
        <div key={pathKey}>
          <div className={styles.pathHeading} onClick={() => toggleOpen(pathKey)}>
          {methods.map((methodKey) => (
            <button 
              key={methodKey}
              className={`${styles.toggleButton} ${styles.collapsiblePath}`}
            >
              {methodKey.toUpperCase()}
            </button>
            ))}
            {pathKey}
          </div>
          {isOpen && (
            <div className={styles.pathContent}>
              {methods.map((methodKey) => (
                <div className={styles.textBoxes} key={methodKey}>
                  {renderTextBoxes(paths[pathKey][methodKey].parameters)}
                  <button className={styles.testButton}>Test</button>
                  <div className={styles.schematext}>
                    Schema
                    <CollapsibleSchema schema={object} name={refName || ''} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div>
      <h1 className={styles.heading}>{data.info.title}</h1>
      <p className={styles.apiName}>Description: {data.info.description}</p>
      <div>{renderPaths(data.paths)}</div>
    </div>
  );
};

const processProperties = (properties: any, schemas: any): any => {
  const object: { [key: string]: any } = {};

  for (const [propName, propDetails] of Object.entries(properties)) {
    const propDetailsAny: any = propDetails;
    if (propDetailsAny.type !== undefined) {
      if (propDetailsAny.type === 'array' && propDetailsAny.items?.$ref) {
        const refName = propDetailsAny.items.$ref.split('/').pop();
        if (refName && schemas[refName]) {
          object[propName] = {
            type: 'array',
            items: processProperties(schemas[refName].properties, schemas),
          };
        } else {
          object[propName] = { type: 'array', items: null };
        }
      } else {
        object[propName] = { type: propDetailsAny.type };
      }
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