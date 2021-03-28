import express from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import { isUri } from 'valid-url'

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());



  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file

  app.get("/filteredimage", async (req, res) => {

      let { image_url } = req.query;        

      if(!image_url || !isUri(image_url)) {
        return res.status(404).send({ message: 'The ' + image_url +  ' does not exist!' });
      }

      try {
        let filteredImagePath = await filterImageFromURL(image_url);
        res.status(200).sendFile(filteredImagePath, () => {
          deleteLocalFiles([filteredImagePath]);
        });
      } catch(error) {
        res.status(422).send("Unable to process this image! try jpg")
      }
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();