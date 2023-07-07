
for (( ; ; ))
do 
    npx ts-node /home/ender/parallel-avatar-scrape/src/index.ts
    git add --all
    git commit -am "update metadata"
    git push
    echo "metadata scraped, sleeping 10m"
    sleep 600
done
