//options
const CLIENT_ID = '291316981809-7e9cprl0en18dbmqahps1i6ah2g6lpsj.apps.googleusercontent.com';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];

// Authorization scopes required by the API. If using multiple scopes,
// separated them with spaces.
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';
const authorizeButton = document.getElementById('auth-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const VideosContainer = document.getElementById('video-container');
const channelData = document.getElementById('channel-data');
const defaultChannel = 'Apollo GraphQL'

channelForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const channel = channelInput.value;
  getChannel(channel);
})


function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

function initClient() {
  gapi.client.init({
    discoveryDocs: DISCOVERY_DOCS,
    clientId: CLIENT_ID,
    scope: SCOPES
  }).then(() => {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  });
}



function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    content.style.display = 'block';
    VideosContainer.style.display = 'block';
    getChannel(defaultChannel);
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
    content.style.display = 'none';
    VideosContainer.style.display = 'none';
  }

}


function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn();

}

function handleSignoutClick() {
  gapi.auth2.getAuthInstance().signOut();

}

function getChannel(Channel) {
  gapi.client.youtube.channels.list({
    part: 'snippet,contentDetails,statistics',
    forUsername: Channel
  }).then((response) => {
    console.log(response);
    const channel = response.result.items[0];
    const data = `
    <ul class='collection'>
    <li class='collection-item'>Title: ${Channel.snippet.title}</li>
    <li class='collection-item'>ID: ${Channel.id}</li>
    <li class='collection-item'>Subscribers: ${numberWithCommas(Channel.statistics.subscriberCount)}</li>
    <li class='collection-item'>Views: ${numberWithCommas(Channel.statistics.viewCount)}</li>
    <li class='collection-item'>Videos: ${numberWithCommas(Channel.statistics.videoCount)}</li>
    </ul>
    <p>${channel.snippet.description}</p>
    </hr>
    <a class='btn grey darken-3' target='_blank' href="https://youtube.com/${channel.snippet.customUrl}">Go to Channel</a> 
    `;
    showChannelData(data);
    const playListId = channel.contentDetails.relatedPlaylist.uploads;
    Videos(playListId)


  })
    .catch((err) => {
      alert('No channel by that name')
    });
}

function Videos(playListId) {
  const requestOptions = {
    playlistId: playListId,
    part: 'snippet',
    maxResults: 20
  };
  const request = gapi.client.youtube.playlistItems.list(requestOptions);
  request.execute(response => {
    console.log(response);
    const playlistData = response.result.items;
    if (playlistData) {
      let data = '</br></br><h4 class="center-align">Latest Videos</h4>';
      //loop through all the videos
      playlistData.forEach(item => {
        const videoId = item.snippet.resourceId.videoId;

        data += `
        <div class='col s3'>
        <iframe width="100%" height="auto" src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0&amp;controls=0&amp;showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
        </div>
        
        `
      });
      VideosContainer.innerHTML = data;
    } else {
      VideosContainer.innerHTML = 'No uploaded videos'
    }
  });
}


function showChannelData(data) {
  channelData.innerHTML = data;

}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}