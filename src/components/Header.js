import {
  AppBar,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core";
import {
  createTheme,
  makeStyles,
  ThemeProvider,
} from "@material-ui/core/styles";
import { useState } from "react";
import { useHistory } from "react-router-dom";
import { CryptoState } from "../CryptoContext";

const useStyles = makeStyles((theme) => ({
  title: {
    flex: 1,
    color: "gold",
    fontFamily: "Montserrat",
    fontWeight: "bold",
    cursor: "pointer",
  },
}));

const darkTheme = createTheme({
  palette: {
    primary: {
      main: "#fff",
    },
    type: "dark",
  },
});

function Header() {
  const classes = useStyles();
  const { currency, setCurrency } = CryptoState();
  const history = useHistory();
  const [openLogin, setOpenLogin] = useState(false);
  const [openSignup, setOpenSignup] = useState(false);
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLoginOpen = () => {
    setOpenLogin(true);
  };

  const handleLoginClose = () => {
    setOpenLogin(false);
  };

  const handleSignupOpen = () => {
    setOpenSignup(true);
  };

  const handleSignupClose = () => {
    setOpenSignup(false);
  };

  const handleLogin = () => {

    if (email === "" || password === "") {
      alert("Please enter your email and password.");
      return;
    }

    // Code for checking if user exists in database
    setLoggedIn(true);

    if (loggedIn) {
      // Code for logging in
      console.log("Logged in!");
      var container = document.getElementById("loginContainer");
      // Hide login and signup buttons
      var loginButton = document.getElementById("loginButton");
      var signupButton = document.getElementById("signupButton");
      loginButton.style.display = "none";
      signupButton.style.display = "none";

      // Create profile button if it doesn't exist and show it
      if (!document.getElementById("profileButton")) {
        var profileButton = document.createElement("button");
        profileButton.innerHTML = "Profile";
        profileButton.id = "profileButton";
        profileButton.className = "MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-textSizeSmall MuiButton-sizeSmall";
        profileButton.addEventListener("click", goToProfile);
        container.appendChild(profileButton);
      }
      else {
        profileButton = document.getElementById("profileButton");
        profileButton.style.display = "inline-block";
      }

      // Create logout button if it doesn't exist and show it
      if (!document.getElementById("logoutButton")) {
        var logoutButton = document.createElement("button");
        logoutButton.innerHTML = "Logout";
        logoutButton.id = "logoutButton";
        logoutButton.className = "MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-textSizeSmall MuiButton-sizeSmall";
        logoutButton.addEventListener("click", handleLogout);
        container.appendChild(logoutButton);
      } 
      else {
        logoutButton = document.getElementById("logoutButton");
        logoutButton.style.display = "inline-block";
      }

      // Close login dialog
      handleLoginClose();
    }

  };

  const handleSignup = () => {
    console.log(username, email, password);
    if (username === "" || email === "" || password === "") {
      alert("Please enter your username, email and password.");
      return;
    }

    // Code for signing up
    console.log("Signed up!");
    // Close signup dialog
    handleSignupClose();

  };

  const handleLogout = () => {
    // Code for logging out
    console.log("Logged out!");
    // Show login and signup buttons
    var loginButton = document.getElementById("loginButton");
    var signupButton = document.getElementById("signupButton");
    loginButton.style.display = "inline-block";
    signupButton.style.display = "inline-block";

    // Remove profile and logout buttons
    var profileButton = document.getElementById("profileButton");
    if(profileButton != null){
      profileButton.style.display = "none";
    }
    var logoutButton = document.getElementById("logoutButton");
    if(logoutButton != null){
      logoutButton.style.display = "none";
    }

  };

  const goToProfile = () => {
    // Code for going to profile page

  };

  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar color="transparent" position="static">
        <Container>
          <Toolbar>
            <Typography
              onClick={() => history.push(`/`)}
              variant="h6"
              className={classes.title}
            >
              Casper's Crypto Corner
            </Typography>
            <div id="loginContainer">
              <Button id="loginButton" color="inherit" onClick={handleLoginOpen}>
                Login
              </Button>
              <Button id="signupButton" color="inherit" onClick={handleSignupOpen}>
                Signup
              </Button>
            </div>
            <Select
              variant="outlined"
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={currency}
              style={{ width: 100, height: 40, marginLeft: 15 }}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <MenuItem value={"USD"}>USD</MenuItem>
              <MenuItem value={"EUR"}>EUR</MenuItem>
              <MenuItem value={"DKK"}>DKK</MenuItem>
            </Select>
          </Toolbar>
        </Container>
      </AppBar>

      <Dialog open={openLogin} onClose={handleLoginClose}>
        <DialogTitle>Login</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your login information here.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email Address / Username"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="dense"
            id="password"
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLoginClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleLogin} color="primary">
            Login
          </Button>
        </DialogActions>
      </Dialog>
      
      <Dialog open={openSignup} onClose={handleSignupClose}>
        <DialogTitle>Signup</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your signup information here.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="username"
            label="Username"
            type="username"
            fullWidth
            value={username}
            onChange={(e) => setUserName(e.target.value)}
          />
          <TextField
            autoFocus
            margin="dense"
            id="email"
            label="Email Address"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="dense"
            id="password"
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSignupClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSignup} color="primary">
            Signup
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

export default Header;
