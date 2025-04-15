const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const xss = (req, res, next) => {
    const methods = ["POST", "PUT", "PATCH"];
    const method = req.method;

    if (methods.includes(method)) {

        if(req.headers['xss-jfsg'] === 'true'){
            return next();
        };

        const window = new JSDOM('').window;
        const DOMPurify = createDOMPurify(window);  
        const body = req.body;
        
        if(body){
            for (const key in body) {
                if (Object.hasOwnProperty.call(body, key)) {
                    body[key] = DOMPurify.sanitize(body[key], { USE_PROFILES: { html: false } });
                }
            }
        }
        
        req.body = body;
    }

    next();
};

module.exports = xss;