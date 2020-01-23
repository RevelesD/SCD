package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type DocumentPDF struct {
	ID          *primitive.ObjectID   `json:"_id"       bson:"_id"`
	FileName    string                `json:"fileName"  bson:"fileName"`
	FileId      *primitive.ObjectID   `json:"fileId"    bson:"fileId"`
	Mimetype    string            	  `json:"mimetype"  bson:"mimetype"`
	Size        int64             	  `json:"size"      bson:"size"`
	Path        string            	  `json:"path"      bson:"path"`
	Category    *primitive.ObjectID   `json:"category"  bson:"category"`
	Owner       *primitive.ObjectID   `json:"owner"     bson:"owner"`
	CreatedAt   int64             	  `json:"createdAt" bson:"createdAt"`
}
