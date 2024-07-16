import { useEffect, useState } from "react";
import FormElement from "../../reusable-code/FormElement.jsx";
import Button from "../../reusable-code/Button.jsx";
import "./Onboarding.css";
import { onboardingQuestions } from "./onboardingQuestions.js";
import { useDispatch, useSelector } from "react-redux";
import { validate } from "../../validation/validate.js";
import { BudgetSlider } from "./BudgetSlider.jsx";
import { stringToUnix, toPennies, generateId } from "../../utils/utils.js";
import {
  checkFormSectionErrors,
  getCountryFromCity,
} from "./onboardingUtils.js";
import { addTrip } from "../../redux/homeSlice.js";
import { useNavigate } from "react-router-dom";
import { currencyCodes } from "./dummyCurrencyCodes.js"; //change format to Jacks data
import { selectCountries } from "../../redux/homeSlice.js";
import "../../css/onboarding.scss";

let currencies = [];

for (const key of Object.keys(currencyCodes)) {
  currencies.push({ value: key, name: key });
}

const Onboarding = () => {
  const [onboardingDetails, setOnboardingDetails] = useState({
    destination: "",
    dates: {
      startDate: "",
      endDate: "",
      startDateIncluded: false,
      endDateIncluded: false,
    },
    budgetTotal: 0,
    homeCurrency: "",
    budgetHotel: 0,
    budgetFood: 0,
    budgetTransport: 0,
    budgetActivities: 0,
    budgetOther: 0,
  });

  const [currentFormSection, setCurrentFormSection] = useState(1);
  const [errors, setErrors] = useState({});
  const [countryCurrency, setCountryCurrency] = useState([]);

  // getCountryCurrency("london", 5);
  // useEffect(() => {
  //   getCountryCurrency(setCountryCurrency);
  // }, []);

  const dispatch = useDispatch();
  const redirect = useNavigate();

  const countries = useSelector(selectCountries);
  let _countries;
  if (countries) {
    _countries = JSON.parse(JSON.stringify(countries));
    _countries = _countries.sort((a, b) => {
      if (a.capitalCity < b.capitalCity) {
        return -1;
      }
      if (a.capitalCity > b.capitalCity) {
        return 1;
      }
      return 0;
    });
  }

  //run state through validate function everytime input is changed.
  useEffect(() => {
    getValidationResult();
  }, [onboardingDetails]);

  const getValidationResult = async () => {
    if (!Object.values(onboardingDetails).length) {
      return;
    }
    const result = await validate(onboardingDetails, "trip");
    setErrors(result);
  };

  //store input in state on every change. if the id is a type of budget, convert to a number before store in state
  //e.target.name is used instead of e.target.id because the MUI sliders do not support id attrs but they do support name.
  //(name is equal to id in form elem so works the same)
  const handleChange = (e) => {
    let input = e.target.value;

    //if input is a checkbox, assign input to checked
    if (e.target.type === "checkbox") {
      input = e.target.checked;
    }

    if (e.target.name.toLowerCase().includes("date")) {
      const data = {
        ...onboardingDetails,
        dates: { ...onboardingDetails.dates, [e.target.name]: input },
      };
      setOnboardingDetails(data);

      return;
    }

    //if id is a type of budget convert to a number
    if (e.target.name.includes("budget")) {
      input = parseInt(e.target.value);
    }
    setOnboardingDetails({ ...onboardingDetails, [e.target.name]: input });
  };

  //make a copy of state. if errors exist abort early. else send data to store and set visible to true to display second half of form
  const handleSubmit = (e) => {
    e.preventDefault();

    //if errors exist abort early
    if (Object.keys(errors).length) {
      return;
    }

    let _onboardingDetails = onboardingDetails;

    //convert budgets to pennies.
    //too repetitive. condense
    const budgetTotal = toPennies(_onboardingDetails.budgetTotal);
    const budgetHotel = toPennies(_onboardingDetails.budgetHotel);
    const budgetFood = toPennies(_onboardingDetails.budgetFood);
    const budgetTransport = toPennies(_onboardingDetails.budgetTransport);
    const budgetActivities = toPennies(_onboardingDetails.budgetActivities);
    const budgetOther = toPennies(_onboardingDetails.budgetOther);

    //turn date strings to date objs and then to timestamps
    let startDate = stringToUnix(_onboardingDetails.dates.startDate);
    let endDate = stringToUnix(_onboardingDetails.dates.endDate);

    const startDateIncluded = _onboardingDetails.dates.startDateIncluded;
    const endDateIncluded = _onboardingDetails.dates.endDateIncluded;

    //spread existing state and update modified keys
    _onboardingDetails = {
      id: generateId("trip"),
      details: {
        ..._onboardingDetails,
        dates: { startDate, endDate, startDateIncluded, endDateIncluded },
        budgetTotal,
        budgetHotel,
        budgetFood,
        budgetTransport,
        budgetActivities,
        budgetOther,
      },
      expenses: [],
      splits: [],
    };

    dispatch(addTrip({ text: "trips", data: _onboardingDetails }));
    redirect("/dashboard");
  };

  const formButtonHandler = () => {
    const errorsPresent = checkFormSectionErrors(currentFormSection, errors);

    if (currentFormSection === 1 && !errorsPresent) {
      getDestinationCurrency(onboardingDetails.destination);
    }
    !errorsPresent ? setCurrentFormSection(currentFormSection + 1) : "";
  };
  const getDestinationCurrency = (city) => {
    //create data list from city-country data
    //if city in data list, select country
    //if not call below api
    //use res from chosen method to call second api
    const country = getCountryFromCity(city);
  };

if (!_countries) {return <p>...Loading</p>}

  return (
    <div className="onboarding">
      <form>
        {currentFormSection === 1 && (
          <div className="formSection">
            <FormElement
              type="text"
              id="destination"
              label="Where are you off to?"
              name="destination"
              value={onboardingDetails.destination}
              callback={handleChange}
              error={errors.destination}
              list={"cities"}
            />
            <datalist id="cities">
              {_countries.map((country) => {
                return (
                  <option
                    key={country["capitalCity"]}
                    value={country["capitalCity"]}
                  ></option>
                );
              })}
            </datalist>
          </div>
        )}
        {currentFormSection === 2 && (
          <div className="formSection">
            <FormElement
              type="date"
              id="startDate"
              label="Choose the start and end dates of your trip"
              name="startDate"
              value={onboardingDetails.dates.startDate}
              callback={handleChange}
              error={errors.startDate}
            />
            <FormElement
              type="date"
              id="endDate"
              name="endDate"
              value={onboardingDetails.dates.endDate}
              callback={handleChange}
              error={errors.endDate}
            />
            <div className="checkboxInput">
              <FormElement
                type="checkbox"
                id="startDateIncluded"
                label="Include first day of trip in budget?"
                name="startDateIncluded"
                value={onboardingDetails.dates.startDateIncluded}
                callback={handleChange}
              />
            </div>
            <div className="checkboxInput">
              <FormElement
                type="checkbox"
                id="endDateIncluded"
                label="Include last day of trip in budget?"
                name="endDateIncluded"
                value={onboardingDetails.dates.endDateIncluded}
                callback={handleChange}
              />
            </div>
          </div>
        )}
        {currentFormSection === 3 && (
          <div className="formSection">
            <div className="budgetTotalSection">
              <FormElement
                type="number"
                id="budgetTotal"
                className="budgetTotal"
                label="Enter your total budget for the trip and the currency of your home country"
                name="budgetTotal"
                value={onboardingDetails.budgetTotal.toString()}
                callback={handleChange}
                error={errors.budgetTotal}
              />
              <FormElement
                type="select"
                id="homeCurrency"
                name="homeCurrency"
                className="homeCurrency"
                choose={true}
                options={currencies}
                value={currencies[0].value}
                callback={handleChange}
                error={errors.homeCurrency}
              />
            </div>
          </div>
        )}
        {currentFormSection === 4 && (
          <div className="formSection">
            <p className="budgetSlidersLabel">
              How would you like to allocate your budget?
            </p>
            {onboardingQuestions.secondaryForm.map((question) => {
              //get rid of primary form as no longer used? then change this name
              return (
                <BudgetSlider
                  key={question.id}
                  label={question.label}
                  budgetTotal={onboardingDetails.budgetTotal}
                  id={question.id}
                  callback={handleChange}
                  onboardingDetails={onboardingDetails}
                />
              );
            })}
          </div>
        )}

        {currentFormSection === 4 ? (
          <FormElement type="button" className="btn" callback={handleSubmit} />
        ) : (
          <Button
            text=">"
            onClick={() => formButtonHandler()}
            animation={true}
          />
        )}
      </form>
    </div>
  );
};

export default Onboarding;
