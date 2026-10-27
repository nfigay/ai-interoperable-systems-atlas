import concepts from '../../data/concepts.json';
import relationsCsv from '../../data/relations.csv?raw';
import model from '../../data/e3/federated-compositions.json';
import configData from '../../data/e3/configurations.json';
import viewData from '../../data/landscape/views.json';
import {parseRelationsCsv} from '../map/graph-data.js';
import {createLandscape} from './landscape.js';
export const atlasLandscape=createLandscape({concepts,relations:parseRelationsCsv(relationsCsv),model,catalog:configData.catalog,views:viewData});
