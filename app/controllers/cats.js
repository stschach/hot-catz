import Controller from '@ember/controller';
import { mapBy, alias } from '@ember/object/computed';
import { set } from '@ember/object';
import { computed } from '@ember/object';
import DS from 'ember-data';

export default Controller.extend({
  listOfVotes: mapBy('model', 'votes'),
  listOfRanks: mapBy('model', 'rank'),
  totalCatz: alias('model.length'),
  leftCatId: null,
  rightCatId: null,
  determineSelected: computed('model.@each.votes', function() {
    let catz = this.get('model');
    let rankList = this.get('listOfRanks');
    let leftRankExists = false;
    let leftCatSet = false;
    let rightRankExists = false;
    let rightCatSet = false;
    let totalCats = this.get('totalCatz');
    var leftCat = document.getElementById('contestant-left');
    var rightCat = document.getElementById('contestant-right');
    let catDisplayLeft = Math.floor((Math.random() * totalCats) + 1);
    let catDisplayRight = Math.floor((Math.random() * totalCats) + 1);
    // Eliminate displaying same cat on both sides
    while (catDisplayLeft == catDisplayRight) {
      catDisplayRight = Math.floor((Math.random() * totalCats) + 1);
    }
    // Eliminate displaying no cat in case there is a tie
    // function findExistingRank(catRankLeft, catRankRight) {
    //   for (let i = 0; i < totalCats; i++) {
    //     if (catRankLeft == rankList[i]) {
    //       leftRankExists = true;
    //       return catRankLeft;
    //     }
    //     if (catRankRight == rankList[i]) {
    //       rightRankExists = true;
    //       return catRankRight;
    //     }
    //   }
    //   catDisplayLeft = rankList[2];
    //   catDisplayRight = rankList[3];
    //   return;
    // }
    // if (!leftRankExists) { catDisplayLeft = findExistingRank(catDisplayLeft+1); }
    // console.log('left rank = '+catDisplayLeft);
    // console.log('right rank = '+catDisplayRight);
    // Display cats according to their randomly chosen rank
    catz.forEach((cat) => {
      if (cat.get('rank') == catDisplayLeft) { // pick cat to show on the right
        leftCat.src = cat.get('imageUrl');
        this.set('leftCatId', cat);
        leftCatSet = true;
        // console.log(this.get('leftCatId.name'));
      }
      if (cat.get('rank') == catDisplayRight) { // pick cat to show on the left
        rightCat.src = cat.get('imageUrl');
        this.set('rightCatId', cat);
        rightCatSet = true;
        // console.log(this.get('rightCatId.name'));
      }
    })
    if (!leftCatSet || !rightCatSet) {
      alert('Whoops.. something went wrong! Please reload the page.');
    }
    return;
  }),
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
    addVoteLeft() {
      let cat = this.get('leftCatId');
      // console.log('vote added to '+cat.name);
      cat.incrementProperty('votes');
      cat.save();
    },
    addVoteRight() {
      let cat = this.get('rightCatId');
      // console.log('vote added to '+cat.name);
      cat.incrementProperty('votes');
      cat.save();
    },
    // Admin handler
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
      var uploadButton = document.getElementById('upload-button').firstChild;
      // Begin the upload
      uploadTask.on('state_changed', function(snapshot) { // progress handler
        let percent = snapshot.bytesTransferred / snapshot.totalBytes * 100;
        uploadButton.data = Math.round(percent)+'%';
        console.log(percent+'% complete');
      }, function(error) { // error handler
        alert('Oh no!\nThe upload failed.\n*Make sure your file is less than 2048x2048 in size.*\nCheck the console or please try again.');
        console.error('Upload Failed:', error);
      }, function() { // success handler
        let uploadUrl = uploadTask.snapshot.metadata.downloadURLs[0];
        console.log('File available at ', uploadUrl);
        // Create a new cat model record
        let cat = store.createRecord('cat', {
          name: catName,
          imageUrl: uploadUrl
        });
        cat.save();
        uploadButton.data = 'Success!'; // indicates upload is complete
        setTimeout(function(){uploadButton.data = 'Upload!';}, 3000); // restores button text after 3 seconds
      });
      this.set('catName', '');
    }
  }
});
