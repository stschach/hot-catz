import Controller from '@ember/controller';
import { mapBy, alias } from '@ember/object/computed';
import { set } from '@ember/object';
import { computed } from '@ember/object';

export default Controller.extend({
  listOfVotes: mapBy('model', 'votes'),
  totalCatz: alias('model.length'),
  computeRank: computed('model.@each.votes', function() {
    let catz = this.get('model');
    let voteList = this.get('listOfVotes');
    let numberOfCuterCats = 0;
    catz.forEach((cat) => {
      for (let i=0; i<this.get('model.length'); i++) {
        if (cat.get('votes') < voteList[i]) {
          numberOfCuterCats++;
        }
      }
      if (numberOfCuterCats == 0) {
        set(cat, 'rank', 1);
      }
      else {
        set(cat, 'rank', numberOfCuterCats+1);
      }
      numberOfCuterCats = 0;
    })
    catz.save();
    return;
  }),
  sortedCats: computed.sort('model', 'sortBy'),
  sortBy: ['rank'],
  store: Ember.inject.service(),
  firebaseApp: Ember.inject.service(),
  imageIsSelected: false,

  actions: {
    addVote(cat) {
      cat.incrementProperty('votes');
      cat.save();
    },
    removeVote(cat) {
      if(cat.get('votes') > 0) {
        cat.decrementProperty('votes');
      }
      cat.save();
    },
    didSelectImage(files) {
      this.set('imageIsSelected', true);
      let reader = new FileReader();
      reader.onloadend = Ember.run.bind(this, function() {
        var dataURL = reader.result;
        var image = document.getElementById('cat-image');
        image.src = dataURL;
        this.set('file', files[0]);
      });
      //debugger;
      reader.readAsDataURL(files[0]);
    },
    newCat() {
      if (!this.get('imageIsSelected')) {
        alert('Oops..\n\nNo image has been selected! Please click the \'choose file...\' button to select an image to upload.');
        return;
      }
      let catName = this.get('catName');
      if (!catName) {
        alert('Please name your cat. You don\'t want us to do it!');
        return;
      }
      this.set('imageIsSelected', false);
      let store = this.get('store');
      // Prepare for upload
      let file = this.get('file');
      var metadata = {
        contentType: 'image/png',
      };
      const storageRef = this.get('firebaseApp').storage().ref();
      let path = file.name+'.png';
      let uploadTask = storageRef.child(path).put(file, metadata);
      // Begin the upload
      uploadTask.on('state_changed', function(snapshot) { // progress handler
        let percent = snapshot.bytesTransferred / snapshot.totalBytes * 100;
        console.log(percent+'% complete');
      }, function(error) { // error handler
        alert('Oh no!\nThe upload failed.\n*Make sure your file is less than 2048x2048 in size.*\nCheck the console or please try again.');
        console.error('Upload Failed:', error);
      }, function() { // success handler
        let uploadUrl = uploadTask.snapshot.metadata.downloadURLs[0];
        console.log('File available at ', uploadUrl);
        // Create a new cat model record
        let cat = store.createRecord('cat', { // ERROR: this.get('store') is not a function :(
          name: catName,
          imageUrl: uploadUrl
        });
        cat.save();
      });
      this.set('catName', '');
    }
  }
});
