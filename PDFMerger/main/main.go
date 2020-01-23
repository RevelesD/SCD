package main

import (
	"../mongogo"
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"time"
)

func main() {
	uri := os.Args[1]
	oids := os.Args[2:]
	ex, err := os.Executable()
	mongogo.CheckError(err)

	exPath := filepath.Dir(ex)
	// Obtain a connection with mongodb
	con, err := mongogo.GetConnection(uri)
	mongogo.CheckError(err)
	defer con.Disconnect(context.Background())
	// Find the files in the db, "SCD" and "documents" can be replaced by arguments provided by the system call
	results, err := mongogo.FindFiles("SCD", "documents", con, &oids)
	mongogo.CheckError(err)
	// Obtain a bucket. "SCD" and "archivos" can be replaced by arguments provided by the system call
	bucket := mongogo.GetBucket("SCD", "archivos", con)
	// Channel used to wait for the download of the files
	cPath := make(chan string)
	go mongogo.DownloadFilesChan(bucket, results, cPath)
	// Array of file paths obtained from the channel
	path := <- cPath
	// Name of the merged file
	name :=  exPath + "\\temps\\finals\\c_" + strconv.FormatInt(time.Now().UnixNano(), 10) + ".pdf"
	// command function to merge the file.
	cmd := exec.Command("pdftk", path + "\\*.pdf", "cat", "output", name)
	//cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err = cmd.Run()
	if err != nil {
		fmt.Println("Error: " + err.Error())
	} else {
		fmt.Println(name)
	}
	err = os.RemoveAll(path)
	mongogo.CheckError(err)
}
