import FormElement from "../../reusable-code/FormElement";

const CheckboxChartIncludingOwed = ({ toggleIncludeOwed }) => {
  return (
    <div className="checkboxIncludeOwed">
      <FormElement
        type="checkbox"
        id="showIncludeOwed"
        label="Include owed splits inside chart"
        callback={(e) => {
          toggleIncludeOwed();
        }}
      />
    </div>
  );
};

export default CheckboxChartIncludingOwed;
