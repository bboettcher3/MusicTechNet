# MusicTechNet

public URL: https://musictechnet.simssa.ca
 
### Overview
In this project, a publicly available web application was developed that visualizes and allows exploration of the publication and authorship networks of McGill music technology disciplines. Labeling publication disciplines is a difficult task, and this project simplifies it by focusing on the heads of each of McGill’s music technology research laboratories. By retrieving only publications authored or co-authored by the lab heads, labels are assigned to publications by the presence of lab heads in their author lists. Using these labels, cluster networks are created utilizing the bibliometric visualization capabilities of VOSviewer (Van Eck and Waltman 2010) and VOSviewer Online to let users interact with the authorship network of publications. A persistent backend server updates the publication lists and networks daily to keep the data up to date.

Additional functions for publication searching and discipline filtering were implemented to encourage users to discover interdisciplinary projects. A dynamic list of publications is present that reflects the current discipline filter state, showing interdisciplinary publications with a higher priority. Users are able to page through the publication list or search for a particular title or author, and can click on an item to open the publication in a new browser tab. Each list item is labeled with the colors of the disciplines it is connected to, allowing users to quickly understand the publication’s topics.

### Tools and Frameworks
The web application is currently hosted on Compute Canada (CC), with a backend created with NodeJS using Nginx as a reverse proxy service. The backend server is responsible for the daily retrieval and parsing of publication data, and stores the network and publication results as retrievable files. The CrossRef web API is used to query for all publications with the McGill laboratory heads as authors, and the server subsequently cleans and processes the results for use in the frontend. The frontend uses the p5js graphics framework to create the dynamic lists and handle interactions in the application’s user interface.
