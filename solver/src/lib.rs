use cspuz_rs_puzzles::puzzles::scrabble;

static mut SHARED_ARRAY: Vec<u8> = Vec::new();

#[no_mangle]
fn solve_scrabble(
    buffer: *const u8,
    buffer_len: usize,
    num_max_answers: usize,
    all_shown: i32,
) -> *const u8 {
    let buffer = unsafe { std::slice::from_raw_parts(buffer, buffer_len) };

    let mut board = vec![];
    let mut idx = 0;

    let height = buffer[idx] as usize;
    idx += 1;
    let width = buffer[idx] as usize;
    idx += 1;

    for _ in 0..height {
        let mut row = vec![];
        for _ in 0..width {
            let v = buffer[idx] as u16 | ((buffer[idx + 1] as u16) << 8);
            idx += 2;
            if v == 0 {
                row.push(None);
            } else if v == 1 {
                row.push(Some(-1));
            } else {
                row.push(Some(v as i32 - 2));
            }
        }
        board.push(row);
    }

    let num_words = buffer[idx] as usize | ((buffer[idx + 1] as usize) << 8);
    idx += 2;
    let mut words = vec![];

    let mut max_char = 0;
    for _ in 0..num_words {
        let length = buffer[idx] as usize;
        idx += 1;
        let mut word = vec![];
        for _ in 0..length {
            let c = buffer[idx] as i32 | ((buffer[idx + 1] as i32) << 8);
            max_char = max_char.max(c);
            idx += 2;
            word.push(c);
        }
        words.push(word);
    }

    let answers = scrabble::enumerate_answers_scrabble(
        &board,
        &words,
        max_char + 1,
        all_shown != 0,
        num_max_answers,
    );

    let mut res_buffer = vec![];
    res_buffer.push((answers.len() & 0xff) as u8);
    res_buffer.push(((answers.len() >> 8) & 0xff) as u8);
    res_buffer.push(((answers.len() >> 16) & 0xff) as u8);
    res_buffer.push(((answers.len() >> 24) & 0xff) as u8);

    for answer in answers {
        for row in answer {
            for cell in row {
                let v = cell + 1;
                res_buffer.push((v & 0xff) as u8);
                res_buffer.push(((v >> 8) & 0xff) as u8);
            }
        }
    }

    unsafe {
        SHARED_ARRAY = res_buffer.clone();
        SHARED_ARRAY.as_ptr()
    }
}
