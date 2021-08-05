import Objection from 'objection';
import { decodeBase64 } from './util';

/**
 * conditionSQL is a helper for deciding what SQL query should be used for string input.
 */
export const queryParser = (condition: string): any => {
  // Create a regex for spliting the query param.
  const matchIdx = [];
  // Regex for splitting on alphanumeric word.
  const re = /\w+/g;
  // Search the match in the string.
  let match = re.exec(condition);
  while (match != null) {
    // Add the match idx to an array.
    matchIdx.push(match.index);
    // Get the next match.
    match = re.exec(condition);
  }

  // Get the column name.
  let column = condition.substring(0, matchIdx[1] - 2);
  // Get the query name.
  const queryString = condition.substring(matchIdx[1], condition.length);

  // Search the operator that match query.
  // LIKE without normalizer
  if (condition.includes('#@')) {
    const operator = 'LIKE';
    const query = `%${queryString}%`;
    return { column, operator, query };
  }
  // LIKE with normalizer
  if (condition.includes('=@')) {
    const operator = 'LIKE';
    const query = `%${queryString}%`.toLowerCase();
    return { column, operator, query };
  }
  // NOT LIKE with normalizer
  if (condition.includes('!@')) {
    const operator = 'LIKE';
    const query = `%${queryString}%`;
    return { column, operator, query };
  }
  // EQUIVALENT
  if (condition.includes('==')) {
    const operator = '=';
    const query = queryString;
    return { column, operator, query };
  }
  // NOT EQUIVALENT
  if (condition.includes('!=')) {
    const operator = '!=';
    const query = queryString;
    return { column, operator, query };
  }
  // GREATER THAN OR EQUAL
  if (condition.includes('>=')) {
    const operator = '>=';
    const query = queryString;
    return { column, operator, query };
  }
  // LESS THAN OR EQUAL
  if (condition.includes('<=')) {
    const operator = '<=';
    const query = queryString;
    return { column, operator, query };
  }
  // Change the column name based on operator size.
  column = condition.substring(0, matchIdx[1] - 1);

  // GREATER THAN
  if (condition.includes('>')) {
    const operator = '>';
    const query = queryString;
    return { column, operator, query };
  }
  // LESS THAN
  if (condition.includes('<')) {
    const operator = '<';
    const query = queryString;
    return { column, operator, query };
  }

  // Return empty object if no operator found.
  return null;
};

/**
 * queryBuilder is a helper class that helps build queries from input params.
 * It will decode inputQuery from URI safe and then decode the result from base64 to regular string.
 */
export const queryBuilder = (inputQuery: string, qBuilder: Objection.QueryBuilder<any, any>)
 : Objection.QueryBuilder<any, any> => {
  // Check if query is not empty
  if (!inputQuery) return qBuilder;

  // Create a new variable for qBuilder.
  let qBuilderNew = qBuilder;

  // Decode the query.
  let decodedQuery = decodeURI(inputQuery);
  decodedQuery = decodeBase64(decodedQuery);

  // Split the query by ';'.
  const andQueries = decodedQuery.split(';');

  // Iterate over each query in andQueries.
  andQueries.forEach((andSubQuery) => {
    // Join every andWhere condition.
    qBuilderNew = qBuilderNew.andWhere((orBuilder) => {
      // The orBuilder is like building or condition in between and condition.
      // For example: (a v b) ^ (c v d). orBuilder now is building (a v b) and then (c v d).

      // Split the query by ','.
      const orQueries = andSubQuery.split('|');

      // Iterate over each query in orQueries.
      orQueries.forEach((orSubQuery) => {
        // Get the orSubQuery condition.
        const queryParams = queryParser(orSubQuery);
        if (queryParams) {
          // Get the column, operator and query from queryParams.
          const { column, operator, query } = queryParams;
          // Join every orWhere condition.
          // eslint-disable-next-line no-param-reassign
          orBuilder = orBuilder.orWhere(column, operator, query);
        }
      });
    });
  });
  console.log(qBuilderNew.toKnexQuery().toString());

  return qBuilderNew;
};
