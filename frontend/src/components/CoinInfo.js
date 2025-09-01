import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  CircularProgress,
  createTheme,
  makeStyles,
  ThemeProvider,
  Typography,
} from "@material-ui/core";
import SelectButton from "./SelectButton";
import { chartDays } from "../config/data";
import { CryptoState } from "../CryptoContext";
import { COIN_HISTORY } from "../config";

const CoinInfo = ({ coin }) => {
  const [historicData, setHistoricData] = useState([]);
  const [days, setDays] = useState(1);
  const { currency } = CryptoState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const useStyles = makeStyles((theme) => ({
    container: {
      width: "75%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 25,
      padding: 40,
      [theme.breakpoints.down("md")]: {
        width: "100%",
        marginTop: 0,
        padding: 20,
        paddingTop: 0,
      },
    },
  }));

  const classes = useStyles();

  useEffect(() => {
    const fetchHistoricData = async () => {
      if (!coin?.id) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(COIN_HISTORY(coin.id, days, currency));
        const data = await response.json();

        if (data.error) {
          console.warn("API Error:", data.error);
          setError("Historical data is unavailable right now.");
          setHistoricData([]);
        } else if (!Array.isArray(data.prices)) {
          setError("Unexpected data format received from API.");
          setHistoricData([]);
        } else {
          setHistoricData(data.prices);
        }
      } catch (error) {
        console.error("Error fetching historical data:", error);
        setError("Unable to fetch historical data. You may be rate-limited.");
        setHistoricData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricData();
  }, [days, currency, coin?.id]);

  const darkTheme = createTheme({
    palette: {
      primary: {
        main: "#fff",
      },
      type: "dark",
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <div className={classes.container}>
        {loading ? (
          <CircularProgress style={{ color: "gold" }} size={250} thickness={1} />
        ) : error ? (
          <Typography style={{ color: "red", fontWeight: 500 }}>
            ⚠️ {error}
          </Typography>
        ) : historicData.length === 0 ? ( // ✅ safe check
          <Typography style={{ color: "grey" }}>
            No price history available
          </Typography>
        ) : (
          <>
            <Line
              data={{
                labels: historicData.map((entry) => {
                  let date = new Date(entry[0]);
                  let time =
                    date.getHours() > 12
                      ? `${date.getHours() - 12}:${date.getMinutes()} PM`
                      : `${date.getHours()}:${date.getMinutes()} AM`;
                  return days === 1 ? time : date.toLocaleDateString();
                }),
                datasets: [
                  {
                    data: historicData.map((entry) => entry[1]),
                    label: `Price (Past ${days} Days) in ${currency}`,
                    borderColor: "#EEBC1D",
                  },
                ],
              }}
              options={{
                elements: { point: { radius: 1 } },
              }}
            />
            <div
              style={{
                display: "flex",
                marginTop: 20,
                justifyContent: "space-around",
                width: "100%",
              }}
            >
              {chartDays.map((day) => (
                <SelectButton
                  key={day.value}
                  onClick={() => setDays(day.value)}
                  selected={day.value === days}
                >
                  {day.label}
                </SelectButton>
              ))}
            </div>
          </>
        )}
      </div>
    </ThemeProvider>
  );
};

export default CoinInfo;
