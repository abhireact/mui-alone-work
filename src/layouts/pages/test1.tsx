import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import MDButton from "components/MDButton";
import MDBox from "components/MDBox";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import Cookies from "js-cookie";
import axios from "axios";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import DataTable from "examples/Tables/DataTable";
import Basic from "layouts/authentication/sign-in/basic";
const token = Cookies.get("token");

const SalaryTemp = () => {
  const [template, setTemplate] = useState("");
  const [description, setDescription] = useState("");
  const [data, setData] = useState([]);
  const [showElements, setShowElements] = useState([]);

  const [annualamount, setAnnualamount] = useState([]);
  const [annualctc, setAnnualctc] = useState(0);
  const [basicpercent, setBasicpercent] = useState(0);

  function transformEarningsArray(earningsArray: any[]) {
    return earningsArray.map(
      (earning: {
        monthly_amount: number;
        earning_type_name: any;
        calculation_type: any;
        enter_amount_or_percent: any;
      }) => {
        if (earning.calculation_type === "% of CTC") {
          const monthly_amount = ((earning.enter_amount_or_percent / 100) * annualctc) / 12;
          return {
            earning_type_name: earning.earning_type_name,
            calculation_type: earning.calculation_type,
            enter_amount_or_percent: earning.enter_amount_or_percent,
            monthly_amount: ((earning.enter_amount_or_percent / 100) * annualctc) / 12,
            annual_amount: monthly_amount * 12,
          };
        } else if (earning.calculation_type === "% of Basic") {
          const monthly_amount = ((earning.enter_amount_or_percent / 100) * basicpercent) / 12;
          return {
            earning_type_name: earning.earning_type_name,
            calculation_type: earning.calculation_type,
            enter_amount_or_percent: earning.enter_amount_or_percent,
            monthly_amount: monthly_amount,
            annual_amount: monthly_amount * 12,
          };
        } else {
          // Handle other calculation types if needed

          return {
            earning_type_name: earning.earning_type_name,
            calculation_type: earning.calculation_type,
            enter_amount_or_percent: earning.enter_amount_or_percent,
            monthly_amount: earning.monthly_amount || 0,
            annual_amount: earning.monthly_amount * 12 || 0,
          };
        }
      }
    );
  }
  const handleChange = (index: any, field: any, value: any) => {
    // Update the state with the modified data
    const updatedElements = [...showElements];
    updatedElements[index] = { ...updatedElements[index], [field]: value };
    setShowElements(updatedElements);
    console.log(showElements, "changing input elements");
  };
  const handleAddField = (addfield: any) => {
    console.log(showElements, "add field");
    setShowElements([...showElements, addfield]);
  };
  const handleRemoveField = (cancelledElement: any) => {
    const updatedElements = showElements.filter((element) => element !== cancelledElement);
    setShowElements(updatedElements);

    console.log(showElements, "remove field");
  };
  useEffect(() => {
    setShowElements(transformEarningsArray(showElements));
  }, [annualctc, showElements, basicpercent]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://10.0.20.133:8000/mg_earning_type", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setBasicpercent(response.data[1].enter_amount_or_percent);
          console.log(Number(response.data[1].enter_amount_or_percent), "basic percent");
          console.log(response.data, " api data");
          const transformarray = transformEarningsArray(response.data);

          setData(transformEarningsArray(transformarray.slice(2, 4)));
          console.log(transformEarningsArray(transformarray.slice(2, 4)), " transform api data");
          setShowElements([transformarray[1]]);
          setBasicpercent(transformarray[1].enter_amount_or_percent);
          console.log(showElements, "default element");
        }
      } catch (error) {
        console.log("Data not found");
      }
    };
    fetchData();
  }, []);
  const dataTableData = {
    columns: [
      { Header: "SALARY COMPONENTS", accessor: "earning_type_name" },
      { Header: "CALCULATION TYPE", accessor: "calculation_type" },
      { Header: "MONTHLY AMOUNT", accessor: "monthly_amount" },
      { Header: "ANNUAL  AMOUNT", accessor: "annual_amount" },
      { Header: "ACTION", accessor: "action" },
    ],

    rows: showElements.map((row, _index) => ({
      calculation_type: (
        <div>
          {row.calculation_type === "% of Basic" || row.calculation_type === "% of CTC" ? (
            <MDTypography variant="p">
              <MDInput
                onChange={(e: { target: { value: any } }) => {
                  handleChange(_index, "enter_amount_or_percent", e.target.value);
                }}
                sx={{ width: "100px" }}
                // value={showElements[_index].enter_amount_or_percent}
                value={showElements[_index].enter_amount_or_percent}
              />
            </MDTypography>
          ) : (
            <MDTypography variant="caption"> system calculated </MDTypography>
          )}
          <MDTypography variant="p"> {row.calculation_type} </MDTypography>
        </div>
      ),
      earning_type_name: <MDTypography variant="p">{row.earning_type_name}</MDTypography>,
      monthly_amount: (
        <MDTypography variant="p">
          {" "}
          <MDInput
            sx={{ width: "100px" }}
            type="number"
            disabled={
              row.calculation_type === "% of CTC" || row.calculation_type === "% of Basic"
                ? true
                : false
            }
            onChange={(e: { target: { value: any } }) => {
              let monthlyAmount = e.target.value;

              handleChange(_index, "monthly_amount", Number(monthlyAmount));
              // Calculate and update annual amount
              const annualAmount = Number(monthlyAmount) * 12;
            }}
            value={showElements[_index].monthly_amount}
          />
        </MDTypography>
      ),
      annual_amount: (
        <MDTypography variant="p">
          <MDInput
            value={showElements[_index].annual_amount}
            disabled
            sx={{ width: "100px" }}
            p={2}
          />
        </MDTypography>
      ),

      action: (
        <>
          {row.calculation_type === "% of CTC" ? (
            <MDButton>
              <RemoveCircleOutlineIcon color="disabled" />
            </MDButton>
          ) : (
            <MDButton>
              <RemoveCircleOutlineIcon onClick={() => handleRemoveField(row)} color="primary" />
            </MDButton>
          )}
        </>
      ),
    })),
  };
  const handleSubmit = () => {
    axios
      .post(
        "http://10.0.20.133:8000/mg_salary_template",
        { showElements },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          console.log("success");
        }
      })
      .catch((error) => {
        console.error("Error deleting task:", error);
        const myError = error as Error;
        console.error("An unexpected error occurred");
      });
  };
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Grid container spacing={2}>
        <Grid item xs={12} sm={12} mb={2}>
          <MDTypography variant="h5">Salary Details</MDTypography>
        </Grid>
        <Grid item sm={3}>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography color="text">Earning</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {data.map((info, index) => (
                <div
                  key={index}
                  style={{
                    display: showElements.some(
                      (a) => a.earning_type_name === info.earning_type_name
                    )
                      ? "none"
                      : "block",
                  }}
                >
                  <Grid container>
                    <Grid item sm={10}>
                      <Typography variant="caption">{info?.earning_type_name}</Typography>
                    </Grid>
                    <Grid item sm={2}>
                      <MDButton color="info" variant="text" onClick={() => handleAddField(info)}>
                        <AddIcon />
                      </MDButton>
                    </Grid>
                  </Grid>
                </div>
              ))}
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item sm={9}>
          <Card>
            <Grid container px={4} pt={2}>
              <Grid item sm={6} sx={{ display: "flex", justifyContent: "center" }}>
                <MDTypography variant="body2" color="text" fontWeight="bold">
                  Template Name
                </MDTypography>
              </Grid>
              <Grid item sm={6} sx={{ display: "flex", justifyContent: "center" }}>
                <MDTypography variant="body2" color="text" fontWeight="bold">
                  Description
                </MDTypography>
              </Grid>
            </Grid>
            <Grid container px={4}>
              <Grid item sm={6} sx={{ display: "flex", justifyContent: "center" }}>
                <MDInput
                  onChange={(e: { target: { value: React.SetStateAction<string> } }) =>
                    setTemplate(e.target.value)
                  }
                  value={template}
                />
              </Grid>
              <Grid item sm={6} sx={{ display: "flex", justifyContent: "center" }}>
                <MDInput
                  onChange={(e: { target: { value: React.SetStateAction<string> } }) =>
                    setDescription(e.target.value)
                  }
                  value={description}
                />
              </Grid>
            </Grid>
            <Grid container p={4}>
              <Grid item sm={3}>
                <MDTypography variant="button" color="text" fontWeight="bold">
                  Annual CTC *
                </MDTypography>
              </Grid>
              <Grid item sm={9} sx={{ display: "flex", justifyContent: "flex-start" }}>
                <MDInput
                  onChange={(e: { target: { value: React.SetStateAction<number> } }) =>
                    setAnnualctc(e.target.value)
                  }
                  value={annualctc}
                />
              </Grid>
            </Grid>

            <DataTable
              table={dataTableData}
              isSorted={false}
              entriesPerPage={false}
              showTotalEntries={false}
            />
          </Card>
        </Grid>
      </Grid>
      <Grid ml={2} mt={4}>
        <MDButton color="info" variant="outlined" onClick={handleSubmit}>
          Save
        </MDButton>
      </Grid>
    </DashboardLayout>
  );
};

export default SalaryTemp;
