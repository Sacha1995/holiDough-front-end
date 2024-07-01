import Joi from "joi";

export const schema = {
    destination: Joi.string().min(1).max(58).required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref("startDate")).required(),
    budgetTotal: Joi.number().min(1).required(), //include max budget?
    homeCurrency: Joi.string().required(),
  };