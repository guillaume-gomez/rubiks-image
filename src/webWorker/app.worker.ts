// to be define
interface dataSend {

}

export default () => {
  self.addEventListener('message', e => { // eslint-disable-line no-restricted-globals

      if (!e) return;
      let { users, type } = e.data;

      if(type === "asc") {
        users = users.sort((a, b) => a.commentCount - b.commentCount);
      } else {
        users = users.sort((a, b) => b.commentCount - a.commentCount);
      }

      setTimeout(() =>{
        postMessage(users);
      }, [5000]);
  })
};