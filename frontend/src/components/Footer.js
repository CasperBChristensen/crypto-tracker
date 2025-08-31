import { Email, GitHub, LinkedIn } from "@material-ui/icons";

function Footer() {

    return (
        <div
            style={{
                marginTop: 32,
                padding: "16px 32px",
                background: "#222",
                color: "#FFD700",
                fontSize: "0.95rem",
                borderRadius: 8,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                fontFamily: "Montserrat",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
            }}
        >
            <span style={{ marginLeft: 8 }}>
                © Copyright 2025 Casper Christensen | All Rights Reserved
            </span>
            <span style={{ display: "flex", gap: 16, alignItems: "center", marginRight: 8 }}>
                <a
                    href="mailto:placeholder@example.com"
                    style={{ color: "#FFD700", textDecoration: "none", display: "flex", alignItems: "center" }}
                    title="Email"
                >
                    <Email />
                </a>
                <a
                    href="https://github.com/placeholder"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#FFD700", textDecoration: "none", display: "flex", alignItems: "center" }}
                    title="GitHub"
                >
                    <GitHub />
                </a>
                <a
                    href="https://linkedin.com/in/placeholder"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#FFD700", textDecoration: "none", display: "flex", alignItems: "center" }}
                    title="LinkedIn"
                >
                    <LinkedIn />
                </a>
            </span>
        </div>
    )
}

export default Footer;
