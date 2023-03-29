// ---- Define your dialogs  and panels here ----
//make effective permission panel
//define id_prefix
let perm_id = "permfile";
//define permission panel
let permission_panel = define_new_effective_permissions(perm_id, add_info_col = true, which_permissions = null);
//append the result to sidepanel
$('#sidepanel').append(permission_panel);
//apply filepath
$('#permfile').attr('filepath', '/C/presentation_documents/important_file.txt');

//add a user selector
let user_id = "userfile";
let user_selector = define_new_user_select_field(user_id, 'Select', on_user_change = function(selected_user){
    //change username attribute of effective permission panel
    $('#permfile').attr('username', selected_user);
});
//append user select field to sidepanel
$('#sidepanel').append(user_selector);


// ---- Display file structure ----

//create dialog
let dialog_id = "diafile";
let dialog = define_new_dialog(dialog_id, title='Permission');

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    perm_dialog.dialog('open')

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});

//open dialog on click
$('.perm_info').click( function(){
    dialog.empty();

    //file path
    let filepath_log = $('#permfile').attr('filepath');
    //console.log(filepath_log);
    //username
    let username_log = $('#permfile').attr('username');
    //console.log(username_log);
    //permission
    let perm_log = $(this).attr('permission_name');
    //console.log(perm_log);

    //turn filepath to file object
    let filepath_obj = path_to_file[filepath_log];
    //turn username to user object
    let username_obj = all_users[username_log];

    //acquire explanation
    let explanation = allow_user_action(filepath_obj, username_obj, perm_log, explain_why = true);
    //turn it into a string
    let explanation_str = get_explanation_text(explanation);

    dialog.append(explanation_str);
    dialog.dialog("open");
});


// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 
