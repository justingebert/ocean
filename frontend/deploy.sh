FRONTEND_DIR=${PWD}

git checkout production
git pull origin production

npm cache clean --force
npm ci
npm run build
rm -rf /var/www/html/*
cp -r ${FRONTEND_DIR}/build/* /var/www/html