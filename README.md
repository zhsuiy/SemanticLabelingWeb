# SemanticLabelingWeb

==== Environment ====
1. Install Nodejs 9.2.0
2. Install Redis (Optional)


==== Website ====

1. Prepare images
1.1 split images
* clear all the directories in "public/images"
* go to "local/global.js" to set group number !!! VERY IMPORTANT
* node split-images
1.2 prepare ground truth images in each "public/images/group-id/" directory
test-id-groundtruth
e.g. "test-0-child", "test-1-child"
These images are used to validate if a labeller is reliable.
The threshold for labelling accuracy can be set in "./routes/results.js" ACCURACY_THRESHOLD

2. init database
* set redis ip and port in database.js !!! VERY IMPORTANT
* run db_flush
* run db_init

3. node ./bin/www

==== Data analysis ===

1. export databse
* run export_label
* run export_worker
* run export_group

2. analysis
* 

