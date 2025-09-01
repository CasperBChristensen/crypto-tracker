import { LinearProgress, makeStyles, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactHtmlParser from "react-html-parser";
import CoinInfo from "../components/CoinInfo";
import Footer from "../components/Footer";
import { numberWithCommas } from "../components/CoinsTable";
import { CryptoState } from "../CryptoContext";
import { SINGLE_COIN } from "../config";

const CoinPage = () => {
  const { id } = useParams();
  const [coin, setCoin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currency, symbol } = CryptoState();

  useEffect(() => {
    const fetchCoin = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try{
        const response = await fetch(SINGLE_COIN(id, currency));
        const data = await response.json();

        if (data.error) {
          console.warn("API Error:", data.error);
          setError("Coin data is unavailable right now.");
          setCoin(null);
        } else {
          setCoin(data);
        }
      } catch (error) {
        console.error("Error fetching coin data:", error);
        setError("Unable to fetch coin data. You may be rate-limited.");
        setCoin(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCoin();
  }, [id, currency]);

  const useStyles = makeStyles((theme) => ({
    container: {
      display: "flex",
      [theme.breakpoints.down("md")]: {
        flexDirection: "column",
        alignItems: "center",
      },
    },
    sidebar: {
      width: "30%",
      [theme.breakpoints.down("md")]: {
        width: "100%",
      },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginTop: 25,
      borderRight: "2px solid grey",
    },
    heading: {
      fontWeight: "bold",
      marginBottom: 20,
      fontFamily: "Montserrat",
    },
    description: {
      width: "100%",
      fontFamily: "Montserrat",
      padding: 25,
      paddingBottom: 15,
      paddingTop: 0,
      textAlign: "justify",
    },
    marketData: {
      alignSelf: "start",
      padding: 25,
      paddingTop: 10,
      width: "100%",
      [theme.breakpoints.down("md")]: {
        display: "flex",
        justifyContent: "space-around",
      },
      [theme.breakpoints.down("sm")]: {
        flexDirection: "column",
        alignItems: "center",
      },
      [theme.breakpoints.down("xs")]: {
        alignItems: "start",
      },
    },
  }));

  const classes = useStyles();

    if (loading) return <LinearProgress style={{ backgroundColor: "gold" }} />;

    if (error) {
      return (
        <>
          <Typography
            variant="h5"
            style={{
              color: "red",
              textAlign: "center",
              marginTop: "2rem",
              fontWeight: 500,
            }}
          >
            {error}
          </Typography>
          <Footer />
        </>
      );
    }
  
    if (!coin) {
      return (
        <>
          <Typography
            variant="h5"
            style={{
              color: "grey",
              textAlign: "center",
              marginTop: "2rem",
            }}
          >
            No coin data available
          </Typography>
          <Footer />
        </>
      );
    }

  return (
    <>
      <div className={classes.container}>
        <div className={classes.sidebar}>
          <img
            src={
              coin?.image?.large ||
              coin?.image?.small ||
              "https://placehold.co/200x200.png"
            }
            alt={coin?.name || "Unknown Coin"}
            height="200"
            style={{ marginBottom: 20 }}
          />
          <Typography variant="h3" className={classes.heading}>
            {coin?.name || "Unknown Coin"}
          </Typography>
          <Typography variant="subtitle1" className={classes.description}>
            {coin?.description?.en
              ? ReactHtmlParser(coin.description.en.split(". ")[0])
              : "No description available."}
          </Typography>

          <div className={classes.marketData}>
            <span style={{ display: "flex" }}>
              <Typography variant="h5" className={classes.heading}>
                Rank:
              </Typography>
              &nbsp; &nbsp;
              <Typography variant="h5" style={{ fontFamily: "Montserrat" }}>
                {coin?.market_cap_rank
                  ? numberWithCommas(coin.market_cap_rank)
                  : "N/A"}
              </Typography>
            </span>

            <span style={{ display: "flex" }}>
              <Typography variant="h5" className={classes.heading}>
                Current Price:
              </Typography>
              &nbsp; &nbsp;
              <Typography variant="h5" style={{ fontFamily: "Montserrat" }}>
                {symbol}{" "}
                {coin?.market_data?.current_price?.[currency.toLowerCase()]
                  ? numberWithCommas(
                      coin.market_data.current_price[currency.toLowerCase()]
                    )
                  : "N/A"}
              </Typography>
            </span>

            <span style={{ display: "flex" }}>
              <Typography variant="h5" className={classes.heading}>
                Market Cap:
              </Typography>
              &nbsp; &nbsp;
              <Typography variant="h5" style={{ fontFamily: "Montserrat" }}>
                {symbol}{" "}
                {coin?.market_data?.market_cap?.[currency.toLowerCase()]
                  ? numberWithCommas(
                      coin.market_data.market_cap[currency.toLowerCase()]
                        .toString()
                        .slice(0, -6)
                    ) + "M"
                  : "N/A"}
              </Typography>
            </span>
          </div>
        </div>

        {/* CoinInfo already has its own error handling */}
        <CoinInfo coin={coin} />
      </div>
      <Footer />
    </>
  );
};

export default CoinPage;
