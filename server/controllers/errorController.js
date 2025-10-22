const handle404 = (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Page not found',
        data: null
    });
};

export default handle404;