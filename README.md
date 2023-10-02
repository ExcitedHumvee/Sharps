# Sharps - Image Sharing Web Application

## Overview

Sharps is a web application that allows users to share, upload, edit, and delete images known as "Sharps." It provides a platform similar to Instagram, where users can interact with each other by commenting on Sharps and leaving ratings.

## Features

### MongoDB Integration and CRUD Operations

-   **Database Storage:** MongoDB is integrated to store Sharps and Reviews data efficiently.
-   **Mongoose Connection:** Mongoose is used to establish a connection between NodeJS and MongoDB Atlas, ensuring seamless communication.

### CRUD Operations for Sharps and Reviews

-   **Create:** Users can upload new Sharps and leave reviews.
-   **Read:** Browse through a collection of Sharps, view detailed information, and read reviews.
-   **Update:** Edit or modify your uploaded Sharps and reviews.
-   **Delete:** Users have the ability to remove their Sharps and associated reviews.

### PassportJS for User Authentication

-   **Secure Access:** PassportJS is employed for user authentication, ensuring secure login using email addresses.

### ExpressJS RESTful Routing

-   **Structured Routing:** ExpressJS is utilized for creating RESTful routes, providing a well-organized and efficient structure to the application.

### Cloudinary for Image Storage

-   **External Image Storage:** Cloudinary is employed to store images on a third-party platform, offering a scalable and reliable solution for image storage.

### MapBox APIs for Geographic Representation

-   **Location Mapping:** MapBox APIs are integrated to display the geographic location where a Sharp was taken.
-   **Worldwide Cluster Map:** The index page features a map showcasing all Sharps taken globally, with clustering for a visually appealing and efficient display.

## Getting Started

1.  **Clone the Repository:**
    
    bashCopy code
    
    `git clone https://github.com/yourusername/sharps.git
    cd sharps` 
    
2.  **Set Up Environment Variables:** Create a `.env` file in the root directory and add the following variables:
    
    makefileCopy code
    
    `MONGODB_URI=your_mongodb_uri
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    MAPBOX_API_TOKEN=your_mapbox_api_token` 
    
3.  **Install Dependencies:**
    
    bashCopy code
    
    `npm install` 
    
4.  **Start the Application:**
    
    bashCopy code
    
    `npm start` 
    
5.  **Access the Application:** Open your web browser and go to [http://localhost:3000](http://localhost:3000/)
    

## Deployment

The application is already deployed on Heroku and can be accessed [here](https://sharps-ff747e1870b7.herokuapp.com/).

## Contributing

Feel free to contribute to the development of Sharps by creating issues or submitting pull requests. Please follow the [contribution guidelines](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors).

## License

This project is licensed under the [MIT License](https://opensource.org/license/mit/).

## Contact

For any inquiries, please contact Stany Desa at [stanydesa@live.com](mailto:stanydesa@live.com).

----------

**Happy Sharpening! 📸**
