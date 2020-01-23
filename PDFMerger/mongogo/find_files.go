package mongogo

import (
	"../models"
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func FindFiles(db string, col string, client *mongo.Client, files *[]string) ([]*models.DocumentPDF, error) {
	collection := client.Database(db).Collection(col)
	// map all the ids from strings to ObjectsIDs
	odis := mapoids(files)
	// build the query to search into the db
	filter := bson.M{"_id": bson.M{"$in": odis}}
	//filter := bson.M{}
	cur, err := collection.Find(context.Background(), filter)
	defer cur.Close(context.Background())
	CheckError(err)

	var results []*models.DocumentPDF

	for cur.Next(context.Background()) {
		var elem models.DocumentPDF
		err := cur.Decode(&elem)
		CheckError(err)

		results = append(results, &elem)
	}

	cur.Close(context.Background())
	return results, nil
}

func mapoids(ids *[]string) []primitive.ObjectID {
	var oids []primitive.ObjectID
	for _, value := range *ids {
		oid, err := primitive.ObjectIDFromHex(value)
		CheckError(err)
		oids = append(oids, oid)
	}
	return oids
}