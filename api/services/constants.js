'use strict';
var path = require('path');
module.exports = Object.freeze({
    LOCAL_UPLOADS_FOLDER_URL: '/api/uploads',
    ABSOLUTE_UPLOADS_FOLDER_URL: path.join(__dirname, '../uploads'),
    PROJECT_ROOT_FOLDER: path.join(__dirname, '..', '..')
});
