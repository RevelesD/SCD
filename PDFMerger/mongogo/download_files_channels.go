package mongogo

import (
	"../models"
	"bufio"
	"bytes"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/gridfs"
	"go.mongodb.org/mongo-driver/mongo/options"
	"os"
	"path/filepath"
	"strconv"
	"time"
)

func DownloadFilesChan(bucket *gridfs.Bucket, docs []*models.DocumentPDF, c chan string) {
	ex, err := os.Executable()
	CheckError(err)
	exPath := filepath.Dir(ex)

	//var names []string
	var b bytes.Buffer
	w := bufio.NewWriter(&b)
	dirName := strconv.FormatInt(time.Now().UnixNano(), 10)
	//fmt.Println(exPath + "\\temps\\" + dirName)
	err = os.Mkdir(exPath + "\\temps\\" + dirName, 0777)
	CheckError(err)
	for _, v := range docs {
		filePath := exPath + "\\temps\\"+ dirName + "\\" + strconv.FormatInt(time.Now().UnixNano(), 10) + ".pdf"
		file, err := os.Create(filePath)
		CheckError(err)
		bufferedWriter := bufio.NewWriter(file)
		_, err = bucket.DownloadToStream(v.FileId, w)
		CheckError(err)

		//names = append(names, filePath)
		b.WriteTo(bufferedWriter)
		file.Close()
	}
	c <- exPath + "\\temps\\"+ dirName
}
// Obtain a bucket.
// @param: db: Name of the db where the bucket is stored
// @param: prefix: name of the bucket collections prefix. [eg: prefix.files, prefix.chunks]
// @return: a configurated bucket to request
func GetBucket(db string, prefix string, c *mongo.Client) *gridfs.Bucket {
	bucketOptions := options.GridFSBucket().SetName(prefix)
	bucket, err := gridfs.NewBucket(c.Database(db), bucketOptions)
	CheckError(err)
	return bucket
}
