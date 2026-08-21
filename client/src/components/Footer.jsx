function Footer() {
    const currentYear = new Date().getFullYear();

    return(
        <footer className="footer">
            <div className="footer-content">
                <p>Copyright &copy; {currentYear} HopOn! All rights reserved.</p>
            </div>
        </footer>
    )
}

export default Footer