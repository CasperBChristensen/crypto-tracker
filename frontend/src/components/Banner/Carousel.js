import { CircularProgress, makeStyles, Typography } from "@material-ui/core";
import { useEffect, useState } from "react";
import AliceCarousel from "react-alice-carousel";
import { Link } from "react-router-dom";
import { CryptoState } from "../../CryptoContext";
import { numberWithCommas } from "../CoinsTable";
import { TRENDING_COINS } from "../../config";

const Carousel = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currency, symbol } = CryptoState();

  useEffect(() => {
    const fetchTrendingCoins = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(TRENDING_COINS(currency));
        const data = await response.json();

        if (data.error) {
          console.warn("API Error:", data.error);
          setTrending([]);
          setError("Trending coins are unavailable right now.");
        } else if (!Array.isArray(data)) {
          setTrending([]);
          setError("Unexpected data format received from API.");
        } else {
          setTrending(data);
        }
      } catch (error) {
        console.error("Error fetching trending coins:", error);
        setTrending([]);
        setError("Unable to fetch trending coins. You may be rate-limited.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingCoins();
  }, [currency]);

  const useStyles = makeStyles((theme) => ({
    carousel: {
      height: "50%",
      display: "flex",
      alignItems: "center",
    },
    carouselItem: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      cursor: "pointer",
      textTransform: "uppercase",
      color: "white",
    },
  }));

  const classes = useStyles();

  const items = trending?.map((coin) => {
    let profit = coin?.price_change_percentage_24h >= 0;

    return (
      <Link className={classes.carouselItem} to={`/coins/${coin?.id || "unknown"}`}>
        <img
          src={coin?.image || "https://placehold.co/80x80.png"}
          alt={coin?.name || "Unknown"}
          height="80"
          style={{ marginBottom: 10 }}
        />
        <span>
          {coin?.symbol?.toUpperCase() || "N/A"}
          &nbsp;
          <span
            style={{
              color: profit > 0 ? "rgb(14, 203, 129)" : "red",
              fontWeight: 500,
            }}
          >
            {profit && "+"}
            {coin?.price_change_percentage_24h?.toFixed(2) ?? "0.00"}%
          </span>
        </span>
        <span style={{ fontSize: 22, fontWeight: 500 }}>
          {symbol}{" "}
          {coin?.current_price ? numberWithCommas(coin.current_price.toFixed(2)) : "N/A"}
        </span>
      </Link>
    );
  }) || [];

  const responsive = {
    0: {
      items: 2,
    },
    512: {
      items: 4,
    },
  };

  return (
    <div className={classes.carousel}>
      {loading ? (
        <CircularProgress style={{ color: "gold" }} />
      ) : error ? (
        <Typography style={{ color: "red", fontWeight: "bold" }}>
          {error}
        </Typography>
      ) : trending.length === 0 ? (
        <Typography style={{ color: "gray" }}>
          No trending coins available.
        </Typography>
      ) : (
        <AliceCarousel
          mouseTracking
          infinite
          autoPlayInterval={1000}
          animationDuration={1500}
          disableDotsControls
          disableButtonsControls
          responsive={responsive}
          items={items}
          autoPlay
        />    
      )}
    </div>
  );
};

export default Carousel;
