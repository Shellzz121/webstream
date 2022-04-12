const APP_ID = "941ffbf94b24457fadfe30c9e6682ae2"
const TOKEN = "006941ffbf94b24457fadfe30c9e6682ae2IAAcp3uqQhA92Sp7EMXR+nTfpXiC2B1XB5ZD87lb4jYMjDG7yMIAAAAAEAB3EU0Y+RdXYgEAAQD4F1di"
const CHANNEL = "sampleVersion2"

const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})

let localTracks = []
let remoteUsers = {}

let joinAndDisplayLocalStream = async () =>  {
    
client.on('user-published', handleUserJoined)    
client.on('user-left', handleUserLeft)  

let UID = await client.join(APP_ID, CHANNEL, TOKEN, null)

localTracks = await AgoraRTC.createMicrophoneAndCameraTracks()

let player = `<div class="video-container" id="user-container-${UID}">
                <div class="video-player" id="user-${UID}"></div>
                </div>`
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

    localTracks[1].play(`user-${UID}`)

    await client.publish([localTracks[0], localTracks[1]])
}

let joinStreams = async () =>{
    await joinAndDisplayLocalStream()
    document.getElementById('join-btn').style.display = 'none'
    document.getElementById('stream-controls').style.display = 'flex'
}

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user
    await client.subscribe(user, mediaType)

    if (mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)
        if (player != null){
            player.remove()
        }

        player = `<div class="video-container" id="user-container-${user.uid}">
                    <div class="video-player" id="user-${user.uid}"></div>
                </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

        user.videoTrack.play(`user-${user.uid}`)
    }

    if (mediaType === 'audio'){
        user.audioTrack.play()
    }
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
}

let leaveAndRemoveLocalStream = async () => {
   for(let i = 0; localTracks.length > i; i++){
       localTracks[i].stop()
       localTracks[i].close()
   } 

   await client.leave()
   document.getElementById('join-btn').style.display = 'block'
   document.getElementById('stream-controls').style.display = 'none'
   document.getElementById('video-streams').innerHTML = ''
}

let toogleMic = async (e) =>{
    if (localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.innerText = 'Mic On'
        e.target.style.backgroundColor = '#1f1f1f8e'
    }else{
        await localTracks[0].setMuted(true)
        e.target.innerText = 'Mic Off'
        e.target.style.backgroundColor = '#EE4B2B'
    }
}

let toogleCamera = async (e) =>{
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
            e.target.innerText = 'Camera On'
            e.target.style.backgroundColor = '#1f1f1f8e'
    }else{
        await localTracks[1].setMuted(true)
        e.target.innerText = 'Camera Off'
        e.target.style.backgroundColor = '#EE4B2B'
    }
}

document.getElementById('join-btn').addEventListener('click', joinStreams)
document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('mic-btn').addEventListener('click', toogleMic)
document.getElementById('camera-btn').addEventListener('click', toogleCamera)