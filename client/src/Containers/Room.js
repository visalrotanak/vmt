import React, { Component } from 'react';
import { connect } from 'react-redux';
import { enterRoomWithCode, populateRoom, requestAccess, clearNotification} from '../store/actions';
import DashboardLayout from '../Layout/Dashboard/Dashboard';
import Aux from '../Components/HOC/Auxil';
import PrivateRoomAccessModal from '../Components/UI/Modal/PrivateRoomAccess';
import PublicAccessModal from '../Components/UI/Modal/PublicAccess'
// import Students from './Students/Students';
class Room extends Component {
  state = {
    owner: false,
    member: false,
    guestMode: true,
    tabs: [
      {name: 'Summary'},
      {name: 'Members'},
    ],
  }

  initialTabs = [
    {name: 'Summary'},
    {name: 'Members'},
  ]

  componentDidMount() {
    const { room, user, populateRoom } = this.props;
    // CHECK ACCESS
    let updatedTabs = [...this.state.tabs];
    let owner = false;
    if (room.creator === user._id) {
      updatedTabs = updatedTabs.concat([{name: 'Grades'}, {name: 'Insights'}]);
      this.initialTabs.concat([{name: 'Grades'}, {name: 'Insights'}])
      owner = true;
      // displayNotifications
      updatedTabs = this.displayNotifications(updatedTabs)
    }
    if (room.members) {
      this.checkAccess();
    }
    // UPDATE ROOM ANYTIME WE'RE HERE SO WE'RE GUARANTEED TO HAVE THE FRESHEST DATA
    populateRoom(room._id)
    // Get Any other notifications
    this.setState({
      tabs: updatedTabs,
      owner,
    })

  }

  componentDidUpdate(prevProps, prevState) {
    console.log('room updated')
    console.log(prevProps.roomNotifications.access.length)
    console.log(this.props.roomNotifications.access.length)
    // THESE ARE SUSCEPTIBLE TO ERRORS BECAUSE YOU COULD GAIN AND LOSE TWO DIFFERENT NTFS IN A SINGLE UPDATE POTENTIALLY? ACTUALLY COULD YOU?
    if (prevProps.room.members.length !== this.props.room.members.length) {
      this.checkAccess();
    }
    if (prevProps.roomNotifications.access.length !== this.props.roomNotifications.access.length) {
      console.log('updateing tabs!!')
      let updatedTabs = this.displayNotifications([...this.state.tabs]);
      this.setState({tabs: updatedTabs})
    }
  }

  checkAccess () {
    if (this.props.room.members.find(member => member.user._id === this.props.user._id)) {
      this.setState({member: true})
    };
  }

  enterWithCode = entryCode => {
    const {room, user} = this.props;
    this.props.enterRoomWithCode(room._id, entryCode, user._id, user.username)
  }

  displayNotifications = (tabs) => {
    const { user, room } = this.props;
    const { roomNotifications } = user;
    if (room.creator === user._id) {
      tabs[1].notifications = roomNotifications.access.length > 0 ? roomNotifications.access.length: '';
    } 
    console.log(tabs)
    return tabs;
  }


  render() {
    const { room, match, user, roomNotifications } = this.props;
    const resource = match.params.resource;
    const contentData = {
      resource,
      parentResource: 'room',
      parentResourceId: room._id,
      userResources: room[resource],
      owner: this.state.owner,
      notifications: roomNotifications.access || [],
      room,
      user,
    }
    const sidePanelData = {
      image: undefined,
      title: room.name,
      details: room.description,
    }

    const crumbs = [
      {title: 'Profile', link: '/myVMT/courses'},
      {title: room.name, link: `/myVMT/rooms/${room._id}/summary`}]
      //@TODO DONT GET THE COURSE NAME FROM THE ROOM...WE HAVE TO WAIT FOR THAT DATA JUST GRAB IT FROM
      // THE REDUX STORE USING THE COURSE ID IN THE URL
    if (room.course) {crumbs.splice(1, 0, {title: room.course.name, link: `/profile/courses/${room.course._id}/activities`})}

    return (
      <Aux>
        {( this.state.owner || this.state.member || (room.isPublic && this.state.guestMode)) ?
          <Aux>
            <DashboardLayout
              routingInfo={this.props.match}
              crumbs={crumbs}
              contentData={contentData}
              sidePanelData={sidePanelData}
              tabs={this.state.tabs}
              activeTab={resource}
              loading={this.props.loading}
              activateTab={event => this.setState({activeTab: event.target.id})}
            />
          </Aux> :
          (room.isPublic ? <PublicAccessModal requestAccess={this.grantPublicAccess}/> : <PrivateRoomAccessModal requestAccess={(entryCode) => this.enterWithCode(entryCode)} course={room.course}/>)}
      </Aux>
    )
  }
}

const mapStateToProps = (store, ownProps) => {
  return {
    room: store.rooms.byId[ownProps.match.params.room_id],
    user: store.user,
    roomNotifications: store.user.roomNotifications,
    loading: store.loading.loading,
  }
}

export default connect(mapStateToProps, {enterRoomWithCode, populateRoom, requestAccess, })(Room);
