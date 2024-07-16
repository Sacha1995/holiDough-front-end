import React from "react";
import { useDispatch, useSelector } from "react-redux";
import "../css/expense.scss";
import {
  addExpenseData,
  selectCurrencyNames,
  selectSelectedTripId,
  selectTrips,
  togglePopUp,
  setSplitData,
  selectSplitData,
  setSplitMax,
  selectSplitMax,
} from "../redux/homeSlice";
import Button from "../reusable-code/Button";
import FormElement from "../reusable-code/FormElement";
import { useState, useEffect } from "react";
import { validate } from "../validation/validate";
import { date } from "joi";
import { getExpenseList } from "../utils/expenseData";
import {
  getActualEndDate,
  getActualStartDate,
  getDateForForm,
} from "../utils/utilsDates";
import { findItem } from "../utils/utils";
import SplitInput from "./SplitInput";

export const AddExpense = ({ animatingOut }) => {
  const splitMax = useSelector(selectSplitMax);
  const splitData = useSelector(selectSplitData);
  const dispatch = useDispatch();
  const tripID = useSelector(selectSelectedTripId);
  const trips = useSelector(selectTrips);
  let expenses = getExpenseList(tripID, trips).expenses;
  const [formData, setFormData] = useState({
    multiDay: false,
    date: new Date().toLocaleDateString("en-CA"),
    endDate: new Date().toLocaleDateString("en-CA"),
    amount: 0,
    split: false,
    currency: "GBP",
    category: "Food",
  });
  const [errors, setErrors] = useState({});
  console.log(errors);
  let [multi, setMulti] = useState(false);
  // const [splitData, setSplitData] = useState([])
  const currencies = useSelector(selectCurrencyNames);
  const categories = [
    { value: "Activities", name: "Activities" },
    { value: "Food", name: "Food" },
    { value: "Transport", name: "Transport" },
    { value: "Hotel", name: "Hotel" },
    { value: "Other", name: "Other" },
  ];

  if (!currencies) {
    return <p>Loading</p>;
  }

  const currency = currencies.map((code) => ({ value: code, name: code }));

  const dataInput = (e) => {
    let target = e.target.name;
    let value;
    value = e.target.value;
    if (value === "true") value = true;
    if (value === "false") value = false;

    setFormData({ ...formData, [target]: value });
    if (target === "amount") dispatch(setSplitMax({ value }));
  };

  useEffect(() => {
    getValidationResult();
  }, [formData]);

  const getValidationResult = async () => {
    if (!Object.values(formData).length) {
      return;
    }
    const result = await validate(formData, "expense");
    setErrors(result); //result returns promise
    // console.log(errors);
  };

  const handleSubmit = () => {
    console.log(errors);
    if (Object.keys(errors).length) {
      console.log(formData, "FAIL", errors);
      return;
    }
    if (formData.description && formData.amount) {
      const result = { formData, splitData };
      console.log(result, "pass");
      dispatch(addExpenseData(result));
    } else {
      console.log("FAIL FINAL");
      return;
    }
  };

  const multiDay = () => {
    setMulti((multi = !multi));
    const inverted = !formData.multiDay;
    setFormData({ ...formData, multiDay: inverted });
  };
  const renderMultiDay = () => {
    if (multi) {
      return (
        <FormElement
          type={"date"}
          label={"End date"}
          name={"endDate"}
          value={formData.endDate}
          id={"endDatePicker"}
          error={errors["endDate"]}
          callback={dataInput}
        />
      );
    } else {
      return <></>;
    }
  };

  let handleAddPerson = () => {
    setSplit([
      ...split,
      <SplitInput tag={split.length} parentCallback={getSplitData} />,
    ]);
  };
  let handleRemovePerson = () => {
    setSplit(split.splice(split.length - 1, 1));
  };

  const getSplitData = (data, tag) => {
    dispatch(setSplitData({ data, tag }));
  };

  const [split, setSplit] = useState([
    <SplitInput tag={0} parentCallback={getSplitData} />,
  ]);
  const renderSplit = () => {
    if (formData.split === true) {
      return (
        <>
          {split}
          <div className="containerBtnSplit">
            <Button
              onClick={handleRemovePerson}
              text={"-"}
              className={"splitRemovePerson"}
            />
            <Button
              onClick={handleAddPerson}
              text={"+"}
              className={"splitAddPerson"}
            />
          </div>
        </>
      );
    }
  };

  //getting datalist
  let datalist = expenses.map((expenses) => {
    return expenses.description;
  });
  datalist = [...new Set(datalist)];
  datalist = datalist.filter((description) => description.trim() !== "");

  //calculating start and enddate of trip
  const trip = findItem(trips, tripID);
  const { details } = trip;
  const { startDateIncluded, endDateIncluded, startDate, endDate } =
    details.dates;
  const actualStartDate = getActualStartDate(startDateIncluded, startDate);
  const actualEndDate = getActualEndDate(endDateIncluded, endDate);

  return (
    <div className="expenseContainer">
      <div className="flex">
        <FormElement
          type={"date"}
          label={"Date"}
          name={"date"}
          value={formData.date}
          id={"datePicker"}
          callback={dataInput}
          minDate={getDateForForm(actualStartDate)}
          maxDate={getDateForForm(actualEndDate)}
        />

        <div className="multiDayCheckboxContainer">
          <div>
            <FormElement
              type={"checkbox"}
              label={!multi && "Multiple days"}
              name={"dateCheck"}
              id={"dateCheck"}
              callback={multiDay}
            />
          </div>
          {renderMultiDay()}
        </div>
      </div>
      <div className="flex">
        <FormElement
          type={"text"}
          label={"Description"}
          name={"description"}
          id={"expenseDescription"}
          error={errors["description"]}
          list={"descriptionOptions"}
          callback={dataInput}
        />
        <datalist id="descriptionOptions">
          {datalist.map((expense, index) => {
            return <option key={index} value={expense}></option>;
          })}
        </datalist>
      </div>
      <div className="flex">
        <FormElement
          type={"select"}
          label={"Category"}
          name={"category"}
          id={"categorySelectExpense"}
          options={categories}
          error={errors["category"]}
          callback={dataInput}
        />
      </div>
      <div className="flex">
        <FormElement
          type={"number"}
          label={"Amount"}
          name={"amount"}
          id={"expenseAmount"}
          minValue={0}
          error={errors["amount"]}
          callback={dataInput}
        />
        <FormElement
          type={"select"}
          name={"currency"}
          id={"currencySelectExpense"}
          options={currency}
          callback={dataInput}
        />
      </div>

      <div className="flex">
        <FormElement
          type={"select"}
          label={"Split"}
          name={"split"}
          id={"splitExpense"}
          options={[
            { value: false, name: "No" },
            { value: true, name: "Yes" },
          ]}
          callback={dataInput}
        />
      </div>
      {renderSplit()}
      <div className="containerBtnPopUp">
        <Button
          text="Cancel"
          className="cancelBtnExpense"
          animation={true}
          onClick={() => dispatch(togglePopUp())}
          disabled={animatingOut}
        />
        <Button
          onClick={handleSubmit}
          text={"Add"}
          className={"expenseSubmit"}
          disabled={animatingOut}
          animation={true}
        />
      </div>
    </div>
  );
};

export default AddExpense;
