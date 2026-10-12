import { ApiError } from '../utils/ApiError.js';

/** validate({ body, query, params }) with zod schemas. Parsed (coerced, stripped) values replace the originals. */
export const validate = (schemas) => (req, _res, next) => {
  for (const key of ['params', 'query', 'body']) {
    if (!schemas[key]) continue;
    const result = schemas[key].safeParse(req[key]);
    if (!result.success) {
      const errors = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
      return next(ApiError.badRequest('Validation failed', errors));
    }
    if (key === 'query') {
      // req.query can be read-only in some setups; store the parsed copy separately.
      req.validatedQuery = result.data;
    } else {
      req[key] = result.data;
    }
  }
  next();
};
