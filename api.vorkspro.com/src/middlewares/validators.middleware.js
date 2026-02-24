import { StatusCodes } from "http-status-codes";
import { validationResult, body, param, query } from "express-validator";
import { generateApiResponse, badWordsCheck } from "../services/utilities.service.js";

const validators = {
  password: (attr) =>
    body(attr)
      .trim()
      .notEmpty().withMessage("Password is required.")
      .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long."),

  name: (attr) =>
    body(attr)
      .trim()
      .notEmpty().withMessage("Name is required.")
      .custom((value) => {
        if (badWordsCheck(value)) {
          throw new Error("Name contains inappropriate language.");
        }
        return true;
      }),

  email: (attr) =>
    body(attr)
      .trim()
      .notEmpty().withMessage("Email is required.")
      .isEmail().withMessage("Email must be valid."),

  generic: (attr, type) => {
    const validator = type === "param" ? param(attr)
                      : type === "query" ? query(attr)
                      : body(attr);
    return validator.trim().notEmpty().withMessage(`${attr} is required.`);
  },
};

/**
 * Unified validation + error-checking middleware
 */
export const validate = (attributes, type = "body", validationArray = []) => {
  const rules = attributes.map((attr) =>
    validationArray.includes(attr) && validators[attr]
      ? validators[attr](attr)
      : validators.generic(attr, type)
  );

  // Return combined middleware array (rules + validation check)
  return [
    ...rules,
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const validationErrors = errors.array().map((err) => err.msg);
        return generateApiResponse(
          res,
          StatusCodes.BAD_REQUEST,
          false,
          validationErrors[0],
          { error: validationErrors }
        );
      }
      next();
    },
  ];
};

// /**
//  * Normalize phone number if present
//  */
// export const normalizePhoneNumber = (req, res, next) => {
//   if (req.body.phone) {
//     req.body.phone = req.body.phone.startsWith("+")
//       ? req.body.phone
//       : `+${req.body.phone}`;
//   }
//   next();
// };
