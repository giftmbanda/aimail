exports.dashboard = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    res.json({
        message: 'Welcome to the dashboard',
        user: req.user
    });
};

exports.loginSuccess = (req, res) => {
    //res.json({ message: 'Login successful', user: req.user });
    if (req.isAuthenticated()) {
        // Redirect to Angular dashboard if the user is authenticated
        console.log("successful login")
        res.redirect('http://localhost:4200/#/dashboard');
      } else {
        // Redirect to a failure page if not authenticated
        console.log("unsuccessful login")
        res.redirect('http://localhost:3000/');
      }
};

exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ message: 'Logout error' });
        res.json({ message: 'Logged out successfully' });
    });
};

exports.handleError = (res, error) => {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error occurred. Please try again.' });
};
