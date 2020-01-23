package mongogo

import (
	"fmt"
	pdf "github.com/pdfcpu/pdfcpu/pkg/api"
	"github.com/pdfcpu/pdfcpu/pkg/pdfcpu"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"time"
)

func JoinPdf(fullName *string, filesList *[]string) ([]string, []error) {
	fmt.Printf("Files List len: %d\n", len(*filesList))
	ex, err := os.Executable()
	CheckError(err)
	exPath := filepath.Dir(ex)
	var docsPerRound = 4
	rounds := len(*filesList) / docsPerRound
	fmt.Printf("Rounds: %d\n", rounds)
	conf := pdfcpu.NewDefaultConfiguration()
	conf.ValidationMode = 2

	//finalPath := exPath + "\\temps\\finals\\" + *fullName

	allFiles := *filesList
	var filesSlice []string

	var i int
	cpaths := make(chan string, rounds)
	cerrors := make(chan error, rounds)
	for i = 0; i < len(allFiles); i = i+docsPerRound {
		time := strconv.FormatInt(time.Now().UnixNano(), 10)

		temp := exPath + "\\temps\\finals\\f_" + time + ".pdf"

		if i + docsPerRound > len(allFiles) {
			filesSlice = allFiles[i:]
			fmt.Printf("Desde %d hasta %s\n", i, "final")
		} else {
			filesSlice = allFiles[i: i+docsPerRound]
			fmt.Printf("Desde %d hasta %d\n", i, i + docsPerRound)
		}
		go subJoin(filesSlice, temp, cpaths, cerrors, conf)
	}
	outs := make([]string, 0, rounds)
	errs := make([]error, 0, rounds)
	i = 0
	for i = 0; i < rounds; i++ {
		select {
			case r := <- cpaths:
				outs = append(outs, r)
			case e := <- cerrors:
				errs = append(errs, e)
		}
	}
	return outs, errs
}

func subJoin(files []string, path string,  c chan string, e chan error, conf *pdfcpu.Configuration) {
	err := pdf.MergeFile(files, path, conf)
	if err != nil {
		fmt.Println("Adding error")
		e <- err
	} else {
		fmt.Println("Adding data")
		c <- path
	}
}

func JoinWithCli(fullName *string, paths *[]string) (string, error) {
	//args := "merge " + "temps\\finals\\" +  *fullName + " *.pdf"
	args := *paths
	args = append([]string{"merge", *fullName}, args...)
	cmd := exec.Command("pdfcpu", args...)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	err := cmd.Run()
	if err != nil {
		return "", err
	}
	return "done", nil
}
